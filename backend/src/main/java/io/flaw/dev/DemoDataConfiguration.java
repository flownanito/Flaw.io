package io.flaw.dev;

import io.flaw.projects.model.Ecosystem;
import io.flaw.projects.model.Project;
import io.flaw.projects.model.TrackedDependency;
import io.flaw.projects.repository.ProjectRepository;
import io.flaw.vulnerabilities.model.VulnerabilitySource;
import io.flaw.vulnerabilities.repository.VulnerabilityRepository;
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
            vulnerabilityRepository.deleteBySource(VulnerabilitySource.DEMO);
            if (projectRepository.count() > 0) {
                return;
            }

            Project project = new Project(
                    "Flaw — ejemplo de análisis",
                    "Proyecto de prueba para verificar el análisis real de dependencias con OSV.",
                    null
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
