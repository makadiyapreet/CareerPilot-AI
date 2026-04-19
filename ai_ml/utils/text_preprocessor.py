"""
Text Preprocessing Module
Handles text cleaning, tokenization, and lemmatization using NLTK.
"""
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)


def preprocess(text: str) -> list:
    """
    Preprocess text by lowercase, removing punctuation, tokenizing,
    removing stopwords, and lemmatizing.

    Args:
        text: Input text string

    Returns:
        List of cleaned tokens
    """
    text = text.lower()

    text = text.translate(str.maketrans('', '', string.punctuation))

    tokens = word_tokenize(text)

    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words]

    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]

    tokens = [token for token in tokens if len(token) > 1]

    return tokens


def text_to_string(tokens: list) -> str:
    """
    Join tokens back into a single string.

    Args:
        tokens: List of tokens

    Returns:
        Joined string
    """
    return ' '.join(tokens)


def extract_keywords(text: str, top_n: int = 20) -> list:
    """
    Extract top N most frequent keywords from text.

    Args:
        text: Input text string
        top_n: Number of top keywords to return

    Returns:
        List of top keywords
    """
    tokens = preprocess(text)
    freq_dist = {}

    for token in tokens:
        freq_dist[token] = freq_dist.get(token, 0) + 1

    sorted_tokens = sorted(freq_dist.items(), key=lambda x: x[1], reverse=True)

    return [token for token, _ in sorted_tokens[:top_n]]
