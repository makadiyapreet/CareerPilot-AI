"""
Test Modules Script
Tests all AI/ML modules with sample inputs.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_job_analyzer():
    """Test job analyzer module."""
    print("\n" + "=" * 50)
    print("Testing Job Analyzer Module")
    print("=" * 50)

    from job_analyzer.job_analyzer import analyze_job

    sample_job = """
    We are looking for a Machine Learning Engineer with 3-5 years of experience.
    The ideal candidate should have expertise in Python, TensorFlow, PyTorch, and scikit-learn.
    Experience with NLP and computer vision is a plus.
    You should have strong communication skills and be able to work in a team.
    Bachelor's degree in Computer Science required, Master's preferred.
    """

    result = analyze_job(sample_job)

    print(f"Job Role: {result['job_role']}")
    print(f"Domain: {result['domain']}")
    print(f"Experience Level: {result['experience_level']}")
    print(f"Technical Skills: {result['technical_skills'][:5]}...")
    print(f"Soft Skills: {result['soft_skills']}")
    print(f"Keywords: {result['keywords'][:5]}...")
    print("✓ Job analyzer test passed!")


def test_resume_scorer():
    """Test resume scorer module."""
    print("\n" + "=" * 50)
    print("Testing Resume Scorer Module")
    print("=" * 50)

    from resume_analyzer.resume_scorer import calculate_resume_score

    sample_resume = """
    John Doe
    john.doe@email.com | (555) 123-4567 | github.com/johndoe

    Summary
    Experienced software engineer with 4 years of experience in Python and machine learning.

    Experience
    Machine Learning Engineer at Tech Corp (2020-2024)
    - Developed ML models using TensorFlow and PyTorch
    - Built data pipelines with Python and Pandas
    - Deployed models to AWS cloud infrastructure

    Education
    Bachelor of Science in Computer Science

    Skills
    Python, TensorFlow, PyTorch, SQL, AWS, Docker, Git
    """

    sample_job = """
    Machine Learning Engineer with Python, TensorFlow, and cloud experience needed.
    Must have knowledge of deep learning and NLP.
    """

    result = calculate_resume_score(sample_resume, sample_job)

    print(f"Resume Score: {result['resume_score']}/100")
    print(f"Job Match: {result['job_match_percentage']}%")
    print(f"Matched Skills: {result['matched_skills']}")
    print(f"Missing Skills: {result['missing_skills']}")
    print(f"Suggestions: {result['improvement_suggestions'][:2]}...")
    print("✓ Resume scorer test passed!")


def test_skill_gap_analyzer():
    """Test skill gap analyzer module."""
    print("\n" + "=" * 50)
    print("Testing Skill Gap Analyzer Module")
    print("=" * 50)

    from skill_gap.skill_gap_analyzer import analyze_skill_gap

    sample_resume = "Python, SQL, Pandas, NumPy, Machine Learning, Git"
    sample_job = "Python, TensorFlow, PyTorch, Docker, Kubernetes, AWS, SQL"

    result = analyze_skill_gap(sample_resume, sample_job)

    print(f"Matched Skills: {result['matched_skills']}")
    print(f"Missing Skills: {[s['skill'] for s in result['missing_skills']]}")
    print(f"Match Percentage: {result['match_percentage']}%")
    print(f"Course Recommendations: {result['course_recommendations'][:2]}")
    print("✓ Skill gap analyzer test passed!")


def test_interview_prep():
    """Test interview preparation modules."""
    print("\n" + "=" * 50)
    print("Testing Interview Prep Module")
    print("=" * 50)

    from interview_prep.question_generator import generate_questions
    from interview_prep.answer_evaluator import evaluate_answer

    questions = generate_questions("Data Analyst", "Medium", count=3)
    print(f"Generated {len(questions)} questions:")
    for q in questions:
        print(f"  - [{q['category']}] {q['question'][:50]}...")

    sample_question = "What is the difference between SQL and NoSQL databases?"
    sample_answer = """
    SQL databases are relational and use structured query language for queries.
    They have a predefined schema and are ideal for complex transactions.
    NoSQL databases are non-relational, offer flexible schemas, and are better
    for handling large volumes of unstructured data. Examples include MongoDB
    and Cassandra for NoSQL, and PostgreSQL and MySQL for SQL.
    """

    eval_result = evaluate_answer(sample_question, sample_answer)
    print(f"\nAnswer Evaluation:")
    print(f"  Relevance Score: {eval_result['relevance_score']}/10")
    print(f"  Length Feedback: {eval_result['length_feedback']}")
    print(f"  Feedback: {eval_result['feedback_text'][:100]}...")
    print("✓ Interview prep module test passed!")


def test_roadmap_generator():
    """Test roadmap generator module."""
    print("\n" + "=" * 50)
    print("Testing Roadmap Generator Module")
    print("=" * 50)

    from roadmap_generator.roadmap_generator import generate_roadmap

    result = generate_roadmap("Data Analyst", missing_skills=["SQL", "Python"])

    print(f"Target Role: {result['target_role']}")
    print(f"Total Steps: {result['total_steps']}")
    print(f"Total Duration: {result['total_estimated_weeks']} weeks")
    print("Steps:")
    for step in result['steps'][:3]:
        print(f"  Step {step['step']}: {step['skill']} ({step['duration']})")
    print("✓ Roadmap generator test passed!")


def test_ats_checker():
    """Test ATS checker module."""
    print("\n" + "=" * 50)
    print("Testing ATS Checker Module")
    print("=" * 50)

    from resume_analyzer.ats_checker import check_ats_compatibility

    sample_resume = """
    John Doe
    john.doe@email.com | (555) 123-4567
    linkedin.com/in/johndoe | github.com/johndoe

    Professional Summary
    Experienced software engineer with expertise in Python and cloud technologies.

    Experience
    Software Engineer at Tech Corp (2020-2024)
    - Developed scalable web applications
    - Led team of 5 developers

    Education
    Bachelor of Science in Computer Science, MIT (2020)

    Skills
    Python, Java, SQL, AWS, Docker, Git, Agile
    """

    result = check_ats_compatibility(sample_resume)

    print(f"ATS Score: {result['ats_score']}/100")
    print(f"Issues Found: {len(result['issues'])}")
    for issue in result['issues'][:3]:
        print(f"  - {issue}")
    print(f"Suggestions: {len(result['suggestions'])}")
    print("✓ ATS checker test passed!")


def main():
    """Run all module tests."""
    print("=" * 60)
    print("CareerBoost AI - Module Testing")
    print("=" * 60)

    tests = [
        ("Job Analyzer", test_job_analyzer),
        ("Resume Scorer", test_resume_scorer),
        ("Skill Gap Analyzer", test_skill_gap_analyzer),
        ("Interview Prep", test_interview_prep),
        ("Roadmap Generator", test_roadmap_generator),
        ("ATS Checker", test_ats_checker),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"\n✗ {name} test FAILED: {str(e)}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 60)

    if failed == 0:
        print("\n✓ All modules are working correctly!")
    else:
        print(f"\n✗ {failed} module(s) have issues that need attention.")

    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
