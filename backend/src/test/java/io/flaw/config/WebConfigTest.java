package io.flaw.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WebConfigTest.TestController.class)
@Import(WebConfig.class)
@TestPropertySource(properties = "flaw.cors.allowed-origins=http://localhost:3000,http://127.0.0.1:3000")
class WebConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowsBothLocalFrontendOrigins() throws Exception {
        for (String origin : new String[]{"http://localhost:3000", "http://127.0.0.1:3000"}) {
            mockMvc.perform(options("/api/test")
                            .header(HttpHeaders.ORIGIN, origin)
                            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.CONTENT_TYPE))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin));
        }
    }

    @RestController
    static class TestController {

        @GetMapping("/api/test")
        String test() {
            return "ok";
        }
    }
}
