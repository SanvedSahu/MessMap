package com.messmap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * MessMap Backend Application entry point.
 * Campus Mess Discovery & Management Platform.
 */
@SpringBootApplication
@EnableJpaAuditing
public class MessMapApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessMapApplication.class, args);
    }
}
