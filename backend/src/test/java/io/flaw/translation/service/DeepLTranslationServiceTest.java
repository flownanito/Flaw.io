package io.flaw.translation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class DeepLTranslationServiceTest {

    @Test
    void translatesTextsWithDeepLAndCachesRepeatedRequests() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        DeepLTranslationService service = new DeepLTranslationService(
                "test-auth-key",
                "https://api-free.deepl.com",
                new ObjectMapper(),
                builder
        );
        server.expect(requestTo("https://api-free.deepl.com/v2/translate"))
                .andExpect(method(POST))
                .andExpect(header("Authorization", "DeepL-Auth-Key test-auth-key"))
                .andExpect(content().json("""
                        {
                          "text": ["The advisory title"],
                          "target_lang": "ES",
                          "preserve_formatting": true
                        }
                        """))
                .andRespond(withSuccess("""
                        {"translations":[{"text":"El título del aviso"}]}
                        """, MediaType.APPLICATION_JSON));

        assertEquals(
                List.of("El título del aviso", "El título del aviso"),
                service.translate(List.of("The advisory title", "The advisory title"), "ES")
        );
        service.translate(List.of("The advisory title"), "ES");
        server.verify();
    }

    @Test
    void reportsWhenDeepLApiKeyIsNotConfigured() {
        DeepLTranslationService service = new DeepLTranslationService(
                "",
                "https://api-free.deepl.com",
                new ObjectMapper(),
                RestClient.builder()
        );

        DeepLTranslationException exception = assertThrows(
                DeepLTranslationException.class,
                () -> service.translate(List.of("The advisory title"), "ES")
        );

        assertEquals(
                "La traducción de avisos requiere configurar DEEPL_AUTH_KEY en el backend.",
                exception.getMessage()
        );
    }

    @Test
    void splitsRequestsToStayWithinDeepLTextCountLimit() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        DeepLTranslationService service = new DeepLTranslationService(
                "test-auth-key",
                "https://api-free.deepl.com",
                new ObjectMapper(),
                builder
        );
        server.expect(requestTo("https://api-free.deepl.com/v2/translate"))
                .andRespond(withSuccess(translationsJson(50), MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api-free.deepl.com/v2/translate"))
                .andRespond(withSuccess(translationsJson(1), MediaType.APPLICATION_JSON));

        List<String> result = service.translate(
                java.util.stream.IntStream.range(0, 51).mapToObj(index -> "Advisory text " + index).toList(),
                "EN"
        );

        assertEquals(51, result.size());
        assertEquals("Translated 50", result.get(49));
        assertEquals("Translated 1", result.get(50));
        server.verify();
    }

    private String translationsJson(int count) {
        String translations = java.util.stream.IntStream.rangeClosed(1, count)
                .mapToObj(index -> "{\"text\":\"Translated " + index + "\"}")
                .collect(java.util.stream.Collectors.joining(","));
        return "{\"translations\":[" + translations + "]}";
    }
}
