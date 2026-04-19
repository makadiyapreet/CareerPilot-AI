"""
Model Training Script
Trains and saves ML models for the CareerBoost AI platform.
"""
import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

DATASETS_DIR = os.path.join(os.path.dirname(__file__), 'datasets')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')


def ensure_models_dir():
    """Create models directory if it doesn't exist."""
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)


def load_datasets():
    """Load datasets from CSV files."""
    job_desc_path = os.path.join(DATASETS_DIR, 'job_descriptions.csv')
    resume_path = os.path.join(DATASETS_DIR, 'resume_samples.csv')

    try:
        job_df = pd.read_csv(job_desc_path)
        resume_df = pd.read_csv(resume_path)
        print(f"Loaded {len(job_df)} job descriptions")
        print(f"Loaded {len(resume_df)} resume samples")
        return job_df, resume_df
    except FileNotFoundError as e:
        print(f"Error loading datasets: {e}")
        return None, None


def train_tfidf_vectorizer(job_df, resume_df):
    """
    Train and save TF-IDF vectorizer on combined text corpus.
    """
    print("\n--- Training TF-IDF Vectorizer ---")

    texts = []
    if job_df is not None:
        texts.extend(job_df['description'].tolist())
    if resume_df is not None:
        texts.extend(resume_df['skills'].tolist())

    if not texts:
        print("No texts available for training")
        return None

    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2)
    )
    vectorizer.fit(texts)

    vectorizer_path = os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl')
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)

    print(f"TF-IDF vectorizer trained on {len(texts)} documents")
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"Saved to: {vectorizer_path}")

    return vectorizer


def train_domain_classifier(job_df, vectorizer):
    """
    Train and save domain classification model.
    """
    print("\n--- Training Domain Classifier ---")

    if job_df is None or vectorizer is None:
        print("Cannot train domain classifier: missing data or vectorizer")
        return None

    X = vectorizer.transform(job_df['description'])
    y = job_df['domain']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    classifier = LogisticRegression(
        max_iter=1000,
        multi_class='multinomial',
        solver='lbfgs'
    )
    classifier.fit(X_train, y_train)

    y_pred = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Domain classifier accuracy: {accuracy:.2%}")

    classifier_path = os.path.join(MODELS_DIR, 'domain_classifier_model.pkl')
    with open(classifier_path, 'wb') as f:
        pickle.dump(classifier, f)

    print(f"Saved to: {classifier_path}")

    return classifier


def train_resume_score_model(resume_df, vectorizer):
    """
    Train a simple model for resume scoring baseline.
    """
    print("\n--- Training Resume Score Model ---")

    if resume_df is None or vectorizer is None:
        print("Cannot train resume score model: missing data or vectorizer")
        return None

    resume_df['experience_score'] = resume_df['experience_years'] * 10
    resume_df['skill_count'] = resume_df['skills'].apply(lambda x: len(x.split(',')))
    resume_df['score'] = resume_df['experience_score'] + resume_df['skill_count'] * 5

    model_data = {
        'avg_skills': resume_df['skill_count'].mean(),
        'avg_experience': resume_df['experience_years'].mean(),
        'domains': resume_df['domain'].unique().tolist()
    }

    model_path = os.path.join(MODELS_DIR, 'resume_score_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)

    print(f"Resume score baseline model created")
    print(f"Average skills per resume: {model_data['avg_skills']:.2f}")
    print(f"Average experience: {model_data['avg_experience']:.2f} years")
    print(f"Saved to: {model_path}")

    return model_data


def main():
    """Main training pipeline."""
    print("=" * 50)
    print("CareerBoost AI - Model Training")
    print("=" * 50)

    ensure_models_dir()

    job_df, resume_df = load_datasets()

    vectorizer = train_tfidf_vectorizer(job_df, resume_df)

    train_domain_classifier(job_df, vectorizer)

    train_resume_score_model(resume_df, vectorizer)

    print("\n" + "=" * 50)
    print("All models trained and saved successfully!")
    print("=" * 50)

    print(f"\nModels saved in: {MODELS_DIR}")
    for filename in os.listdir(MODELS_DIR):
        if filename.endswith('.pkl'):
            filepath = os.path.join(MODELS_DIR, filename)
            size = os.path.getsize(filepath)
            print(f"  - {filename} ({size / 1024:.2f} KB)")


if __name__ == "__main__":
    main()
