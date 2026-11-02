package io.flaw.translation.service;

public class DeepLTranslationException extends RuntimeException {

    public DeepLTranslationException(String message) {
        super(message);
    }

    public DeepLTranslationException(String message, Throwable cause) {
        super(message, cause);
    }
}
