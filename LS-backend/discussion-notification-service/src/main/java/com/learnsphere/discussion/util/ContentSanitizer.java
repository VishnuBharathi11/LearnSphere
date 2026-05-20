package com.learnsphere.discussion.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class ContentSanitizer {
    private static final String BIDI_CONTROL_CHARS = "[\\u202A-\\u202E\\u2066-\\u2069\\u200E\\u200F]";

    public String sanitize(String input) {
        String cleaned = Jsoup.clean(input == null ? "" : input, Safelist.basic());
        // Strip hidden bidi control characters that can make LTR text appear reversed.
        return cleaned.replaceAll(BIDI_CONTROL_CHARS, "");
    }
}
