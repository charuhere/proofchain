/**
 * Redact sensitive information from text strings
 * Targeted at: SSNs, Credit Cards, Emails, and Phone Numbers
 */
export const redactSensitiveData = (text) => {
    if (!text) return "";

    // Redact email addresses
    text = text.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[REDACTED_EMAIL]');

    // Redact phone numbers (US format: 123-456-7890 or (123) 456-7890)
    text = text.replace(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[REDACTED_PHONE]');

    // Redact credit card patterns (16 digits)
    text = text.replace(/\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g, '[REDACTED_CC]');

    // Redact SSN (XXX-XX-XXXX)
    text = text.replace(/\d{3}-\d{2}-\d{4}/g, '[REDACTED_SSN]');

    return text;
};
