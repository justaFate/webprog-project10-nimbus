package vn.iotstar.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Nimbus JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    private final String SECRET_KEY = "3cfa76ef14937c1c0ea519f8fc057a80fcd04a7420f8e8bcd0a7567c272e007b";
    private final long EXPIRATION_TIME = 3600000;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION_TIME);

        userDetails = User.builder()
                .username("test@example.com")
                .password("password123")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

    @Test
    @DisplayName("Should successfully generate non-empty JWT token using Nimbus JOSE")
    void testGenerateToken_Success() {
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    @DisplayName("Should correctly extract username from Nimbus JWT token")
    void testExtractUsername_Success() {
        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    @DisplayName("Should correctly extract roles from Nimbus JWT claims")
    void testExtractRoles_Success() {
        String token = jwtService.generateToken(userDetails);
        List<String> roles = jwtService.extractRoles(token);

        assertNotNull(roles);
        assertTrue(roles.contains("ROLE_USER"));
    }

    @Test
    @DisplayName("Should validate valid token with corresponding UserDetails")
    void testIsTokenValid_Success() {
        String token = jwtService.generateToken(userDetails);
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should invalidate token when checked against different user")
    void testIsTokenValid_WrongUser() {
        String token = jwtService.generateToken(userDetails);
        UserDetails anotherUser = User.builder()
                .username("another@example.com")
                .password("pass")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();

        boolean isValid = jwtService.isTokenValid(token, anotherUser);
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject tampered token with invalid signature")
    void testIsTokenValid_TamperedToken() {
        String token = jwtService.generateToken(userDetails);
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        boolean isValid = jwtService.isTokenValid(tamperedToken, userDetails);
        assertFalse(isValid);
    }
}
