package com.adjuster.system.security;

import com.adjuster.system.entity.User;
import com.adjuster.system.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 로그인/회원가입 기능을 제거한 Mockup 환경에서, 모든 요청을 데모 사용자로 자동 인증한다.
 * 컨트롤러의 @AuthenticationPrincipal UserDetails 가 그대로 동작하도록 한다.
 */
@Component
@RequiredArgsConstructor
public class DemoAuthFilter extends OncePerRequestFilter {

    public static final String DEMO_EMAIL = "demo@adjuster.com";

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        User user = userRepository.findByEmail(DEMO_EMAIL).orElse(null);
        if (user != null) {
            UserDetails ud = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword() != null ? user.getPassword() : "",
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }
}
