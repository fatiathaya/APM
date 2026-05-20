"""
Test script for Python Flask API
Run this after starting predict_api.py to verify it's working correctly
"""

import requests
import json

API_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*50)
    print("Testing /health endpoint...")
    print("="*50)
    
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Health check PASSED")
            return True
        else:
            print("❌ Health check FAILED")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure predict_api.py is running on port 5000")
        return False

def test_features():
    """Test features endpoint"""
    print("\n" + "="*50)
    print("Testing /features endpoint...")
    print("="*50)
    
    try:
        response = requests.get(f"{API_URL}/features")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Features: {data.get('total_features')}")
        print(f"Features: {data.get('features')}")
        
        if response.status_code == 200 and data.get('total_features') == 22:
            print("✅ Features endpoint PASSED")
            return True
        else:
            print("❌ Features endpoint FAILED")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_prediction():
    """Test prediction endpoint with sample data"""
    print("\n" + "="*50)
    print("Testing /predict endpoint...")
    print("="*50)
    
    # Sample test data (low risk profile)
    test_data = {
        "Age": 65,
        "Gender": 0,
        "BMI": 23.5,
        "Smoking": 0,
        "AlcoholConsumption": 0,
        "PhysicalActivity": 5.0,
        "DietQuality": 6.0,
        "SleepQuality": 7.0,
        "FamilyHistoryAlzheimers": 0,
        "CardiovascularDisease": 0,
        "Diabetes": 0,
        "Depression": 0,
        "HeadInjury": 0,
        "Hypertension": 0,
        "SystolicBP": 120,
        "DiastolicBP": 80,
        "CholesterolTotal": 200,
        "MMSE": 27,
        "FunctionalAssessment": 7.8,
        "MemoryComplaints": 0,
        "BehavioralProblems": 0,
        "ADL": 8.5
    }
    
    print("Sending test data:")
    print(json.dumps(test_data, indent=2))
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get('success'):
            print("\n✅ Prediction endpoint PASSED")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Probability: {result.get('probability_percentage')}%")
            print(f"   Status: {result.get('status_text')}")
            return True
        else:
            print("❌ Prediction endpoint FAILED")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_prediction_high_risk():
    """Test prediction with high risk profile"""
    print("\n" + "="*50)
    print("Testing /predict with HIGH RISK profile...")
    print("="*50)
    
    # High risk profile (low MMSE, poor health indicators)
    test_data = {
        "Age": 80,
        "Gender": 1,
        "BMI": 28.0,
        "Smoking": 1,
        "AlcoholConsumption": 1,
        "PhysicalActivity": 1.0,
        "DietQuality": 3.0,
        "SleepQuality": 4.0,
        "FamilyHistoryAlzheimers": 1,
        "CardiovascularDisease": 1,
        "Diabetes": 1,
        "Depression": 1,
        "HeadInjury": 1,
        "Hypertension": 1,
        "SystolicBP": 160,
        "DiastolicBP": 100,
        "CholesterolTotal": 280,
        "MMSE": 18,
        "FunctionalAssessment": 3.5,
        "MemoryComplaints": 1,
        "BehavioralProblems": 1,
        "ADL": 4.0
    }
    
    print("Sending high risk test data...")
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get('success'):
            print("\n✅ High risk prediction PASSED")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Probability: {result.get('probability_percentage')}%")
            print(f"   Status: {result.get('status_text')}")
            return True
        else:
            print("❌ High risk prediction FAILED")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_missing_features():
    """Test prediction with missing features (should fail)"""
    print("\n" + "="*50)
    print("Testing /predict with MISSING features...")
    print("="*50)
    
    # Incomplete data (missing several features)
    test_data = {
        "Age": 65,
        "Gender": 0,
        "BMI": 23.5
        # Missing 19 other features
    }
    
    print("Sending incomplete data (should fail)...")
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 400 and not result.get('success'):
            print("\n✅ Missing features validation PASSED (correctly rejected)")
            return True
        else:
            print("❌ Missing features validation FAILED (should have been rejected)")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*50)
    print("  PYTHON FLASK API TEST SUITE")
    print("="*50)
    print("\nMake sure predict_api.py is running on port 5000")
    print("Press Enter to start tests...")
    input()
    
    results = []
    
    # Run all tests
    results.append(("Health Check", test_health()))
    results.append(("Features List", test_features()))
    results.append(("Low Risk Prediction", test_prediction()))
    results.append(("High Risk Prediction", test_prediction_high_risk()))
    results.append(("Missing Features Validation", test_missing_features()))
    
    # Summary
    print("\n" + "="*50)
    print("  TEST SUMMARY")
    print("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please check the API.")
    
    print("\n" + "="*50)

if __name__ == "__main__":
    main()
