package com.learnsphere.discussion.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class ContentSanitizer {
    public String sanitize(String input) {
        return Jsoup.clean(input == null ? "" : input, Safelist.basic());
    }
}
