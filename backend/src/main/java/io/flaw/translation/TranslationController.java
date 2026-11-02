package io.flaw.translation;

import io.flaw.translation.dto.TranslationRequest;
import io.flaw.translation.dto.TranslationResponse;
import io.flaw.translation.service.DeepLTranslationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/translation")
public class TranslationController {

    private final DeepLTranslationService translationService;

    public TranslationController(DeepLTranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping("/translate")
    public TranslationResponse translate(@Valid @RequestBody TranslationRequest request) {
        return new TranslationResponse(
                translationService.translate(request.texts(), request.targetLanguage())
        );
    }
}
