package io.flaw.translation.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class DeepLTranslationService {

    private static final int MAX_TEXTS_PER_REQUEST = 50;
    private static final int MAX_DEEPL_REQUEST_BYTES = 100_000;
    private static final int MAX_CACHE_ENTRIES = 1_000;

    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final Map<CacheKey, String> translationsCache = new LinkedHashMap<>(128, 0.75f, true);

    public DeepLTranslationService(
            @Value("${flaw.translation.deepl.api-key:}") String apiKey,
            @Value("${flaw.translation.deepl.base-url:https://api-free.deepl.com}") String baseUrl,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder
    ) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.restClient = restClientBuilder.clone().baseUrl(baseUrl).build();
    }

    public synchronized List<String> translate(List<String> texts, String targetLanguage) {
        if (texts.isEmpty()) {
            return List.of();
        }
        List<String> translations = new ArrayList<>(Collections.nCopies(texts.size(), null));
        Map<String, List<Integer>> missingTextIndexes = new LinkedHashMap<>();
        for (int index = 0; index < texts.size(); index++) {
            String text = texts.get(index);
            if (text == null || text.isBlank()) {
                translations.set(index, text == null ? "" : text);
                continue;
            }
            String translated = translationsCache.get(new CacheKey(targetLanguage, text));
            if (translated != null) {
                translations.set(index, translated);
            } else {
                missingTextIndexes.computeIfAbsent(text, ignored -> new ArrayList<>()).add(index);
            }
        }
        if (missingTextIndexes.isEmpty()) {
            return List.copyOf(translations);
        }
        if (apiKey.isBlank()) {
            throw new DeepLTranslationException(
                    "La traducción de avisos requiere configurar DEEPL_AUTH_KEY en el backend."
            );
        }

        List<String> missingTexts = List.copyOf(missingTextIndexes.keySet());
        List<List<String>> batches = createBatches(missingTexts, targetLanguage);
        List<String> translatedTexts = new ArrayList<>(missingTexts.size());
        for (List<String> batch : batches) {
            translatedTexts.addAll(translateBatch(batch, targetLanguage));
        }
        for (int index = 0; index < missingTexts.size(); index++) {
            String text = missingTexts.get(index);
            String translated = translatedTexts.get(index);
            translationsCache.put(new CacheKey(targetLanguage, text), translated);
            for (int originalIndex : missingTextIndexes.get(text)) {
                translations.set(originalIndex, translated);
            }
            if (translationsCache.size() > MAX_CACHE_ENTRIES) {
                translationsCache.remove(translationsCache.keySet().iterator().next());
            }
        }
        return List.copyOf(translations);
    }

    private List<List<String>> createBatches(List<String> texts, String targetLanguage) {
        List<List<String>> batches = new ArrayList<>();
        List<String> currentBatch = new ArrayList<>();

        for (String text : texts) {
            if (text == null || text.isBlank()) {
                currentBatch.add(text == null ? "" : text);
            } else {
                currentBatch.add(text);
            }

            if (currentBatch.size() > MAX_TEXTS_PER_REQUEST
                    || requestSize(currentBatch, targetLanguage) > MAX_DEEPL_REQUEST_BYTES) {
                String lastText = currentBatch.removeLast();
                if (currentBatch.isEmpty()) {
                    throw new DeepLTranslationException("Un texto supera el tamaño máximo admitido por DeepL.");
                }
                batches.add(List.copyOf(currentBatch));
                currentBatch = new ArrayList<>(List.of(lastText));
                if (requestSize(currentBatch, targetLanguage) > MAX_DEEPL_REQUEST_BYTES) {
                    throw new DeepLTranslationException("Un texto supera el tamaño máximo admitido por DeepL.");
                }
            }
        }

        if (!currentBatch.isEmpty()) {
            batches.add(List.copyOf(currentBatch));
        }
        return batches;
    }

    private int requestSize(List<String> texts, String targetLanguage) {
        try {
            return objectMapper.writeValueAsBytes(new DeepLRequest(texts, targetLanguage, true)).length;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not encode the DeepL translation request.", exception);
        }
    }

    private List<String> translateBatch(List<String> texts, String targetLanguage) {
        try {
            DeepLResponse response = restClient.post()
                    .uri("/v2/translate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "DeepL-Auth-Key " + apiKey)
                    .body(new DeepLRequest(texts, targetLanguage, true))
                    .retrieve()
                    .body(DeepLResponse.class);

            if (response == null || response.translations() == null
                    || response.translations().size() != texts.size()
                    || response.translations().stream()
                            .anyMatch(translation -> translation == null || translation.text() == null)) {
                throw new DeepLTranslationException("DeepL devolvió una respuesta de traducción incompleta.");
            }
            return response.translations().stream()
                    .map(DeepLTranslation::text)
                    .toList();
        } catch (RestClientException exception) {
            throw new DeepLTranslationException(
                    "No se pudieron traducir los avisos con DeepL. Se muestran los textos originales.",
                    exception
            );
        }
    }

    private record CacheKey(String targetLanguage, String text) {
    }

    private record DeepLRequest(
            List<String> text,
            @JsonProperty("target_lang") String targetLanguage,
            @JsonProperty("preserve_formatting") boolean preserveFormatting
    ) { }

    private record DeepLResponse(List<DeepLTranslation> translations) {
    }

    private record DeepLTranslation(String text) {
    }
}
