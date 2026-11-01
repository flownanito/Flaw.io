package io.flaw.vulnerabilities.service;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class OsvClientConfiguration {

    @Bean
    RestClient osvRestClient(
            RestClient.Builder builder,
            @Value("${flaw.osv.base-url:https://api.osv.dev}") String baseUrl
    ) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        return builder.baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }
}
