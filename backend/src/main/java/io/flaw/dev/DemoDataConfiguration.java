package io.flaw.dev;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.vulnerabilities.model.Vulnerability;
import io.flaw.vulnerabilities.model.VulnerabilitySource;
import io.flaw.vulnerabilities.repository.VulnerabilityRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DemoDataConfiguration {

    @Bean
    ApplicationRunner loadDemoData(
            ProjectRepository projectRepository,
            VulnerabilityRepository vulnerabilityRepository
    ) {
        return args -> {
            if (projectRepository.count() > 0 || vulnerabilityRepository.count() > 0) {
                return;
            }

            Vulnerability log4Shell = new Vulnerability(
                    "CVE-2021-44228",
                    "Apache Log4j2 JNDI features do not protect against attacker controlled LDAP",
                    "Demo record. Verify current vendor guidance before making remediation decisions.",
                    Ecosystem.MAVEN,
                    "org.apache.logging.log4j:log4j-core",
                    "< 2.15.0",
                    "2.15.0",
                    new BigDecimal("10.0"),
                    Instant.parse("2021-12-10T10:15:00Z"),
                    VulnerabilitySource.DEMO
            );
            Vulnerability spring4Shell = new Vulnerability(
                    "CVE-2022-22965",
                    "Spring Framework data binding vulnerability",
                    "Demo record. Verify current vendor guidance before making remediation decisions.",
                    Ecosystem.MAVEN,
                    "org.springframework:spring-beans",
                    "< 5.3.20",
                    "5.3.20",
                    new BigDecimal("9.8"),
                    Instant.parse("2022-03-31T12:00:00Z"),
                    VulnerabilitySource.DEMO
            );
            vulnerabilityRepository.saveAll(List.of(log4Shell, spring4Shell));

            Project project = new Project(
                    "flaw-demo",
                    "Proyecto de demostración con dependencias vulnerables conocidas.",
                    "https://github.com/example/flaw-demo"
            );
            project.addDependency(new TrackedDependency(
                    Ecosystem.MAVEN,
                    "org.apache.logging.log4j:log4j-core",
                    "2.14.1"
            ));
            project.addDependency(new TrackedDependency(
                    Ecosystem.MAVEN,
                    "org.springframework:spring-beans",
                    "5.3.19"
            ));
            projectRepository.save(project);
        };
    }
}
