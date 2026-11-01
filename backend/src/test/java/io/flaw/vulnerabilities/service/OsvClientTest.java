package io.flaw.vulnerabilities.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import io.flaw.projects.model.Ecosystem;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class OsvClientTest {

    @Test
    void queriesOsvWithThePackageEcosystemAndExactVersion() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.osv.dev");
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OsvClient client = new OsvClient(builder.build());

        server.expect(requestTo("https://api.osv.dev/v1/query"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("""
                        {
                          "package": {"name": "lodash", "ecosystem": "npm"},
                          "version": "4.17.20"
                        }
                        """))
                .andRespond(withSuccess("""
                        {
                          "vulns": [{
                            "id": "GHSA-29mw-wpgm-hmr9",
                            "summary": "Regular Expression Denial of Service",
                            "affected": [{
                              "package": {"name": "lodash", "ecosystem": "npm"},
                              "ranges": [{
                                "type": "SEMVER",
                                "events": [{"introduced": "0"}, {"fixed": "4.17.21"}]
                              }]
                            }]
                          }]
                        }
                        """, MediaType.APPLICATION_JSON));

        var result = client.query(Ecosystem.NPM, "lodash", "4.17.20");

        assertEquals(1, result.size());
        assertEquals("GHSA-29mw-wpgm-hmr9", result.getFirst().id());
        assertEquals("lodash", result.getFirst().affected().getFirst().packageInfo().name());
        server.verify();
    }
}
