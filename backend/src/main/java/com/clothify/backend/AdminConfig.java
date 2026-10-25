
package com.clothify.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class AdminConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${CLOTHIFY_ADMIN_USERNAME}") String username,
            @Value("${CLOTHIFY_ADMIN_PASSWORD}") String password,
            PasswordEncoder passwordEncoder) {

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalStateException(
                "Clothify admin username and password must be configured."
            );
        }

        if (password.length() < 12) {
            throw new IllegalStateException(
                "Clothify admin password must be at least 12 characters."
            );
        }

        UserDetails admin = User.withUsername(username)
            .password(passwordEncoder.encode(password))
            .roles("ADMIN")
            .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
