from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model saat aplikasi dimulai
MODEL_PATH = 'model_alzheimer_final (2).pkl'
model_data = None

try:
    model_data = joblib.load(MODEL_PATH)
    print("✓ Model berhasil dimuat!")
    print(f"✓ Fitur yang dibutuhkan: {model_data['features']}")
except Exception as e:
    print(f"✗ Error loading model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint untuk mengecek status API"""
    if model_data is not None:
        return jsonify({
            'status': 'healthy',
            'model_loaded': True,
            'features': model_data['features']
        }), 200
    else:
        return jsonify({
            'status': 'unhealthy',
            'model_loaded': False,
            'error': 'Model not loaded'
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint untuk prediksi Alzheimer
    Menerima data JSON dengan 22 fitur sesuai model
    """
    try:
        if model_data is None:
            return jsonify({
                'error': 'Model not loaded',
                'success': False
            }), 500

        # Ambil data dari request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'success': False
            }), 400

        # Daftar fitur yang dibutuhkan (sesuai urutan training)
        required_features = model_data['features']
        
        # Validasi semua fitur ada
        missing_features = [f for f in required_features if f not in data]
        if missing_features:
            return jsonify({
                'error': f'Missing features: {missing_features}',
                'success': False,
                'required_features': required_features
            }), 400

        # Susun input sesuai urutan fitur model
        input_features = []
        for feature in required_features:
            value = data[feature]
            # Konversi ke float
            try:
                input_features.append(float(value))
            except (ValueError, TypeError):
                return jsonify({
                    'error': f'Invalid value for feature {feature}: {value}',
                    'success': False
                }), 400

        # Reshape untuk prediksi (1 sample, 22 features)
        input_array = np.array(input_features).reshape(1, -1)
        
        # Prediksi
        model = model_data['model']
        prediction = model.predict(input_array)[0]  # 0 atau 1
        probability = model.predict_proba(input_array)[0]  # [prob_class_0, prob_class_1]
        
        # Probability untuk kelas positif (Alzheimer = 1)
        alzheimer_probability = float(probability[1])
        alzheimer_percentage = round(alzheimer_probability * 100, 1)
        
        # Tentukan status risiko
        is_high_risk = alzheimer_percentage >= 50.0
        status_text = "High Risk Alzheimer" if is_high_risk else "Low Risk Alzheimer"
        
        # Response
        return jsonify({
            'success': True,
            'prediction': int(prediction),  # 0 = No Alzheimer, 1 = Alzheimer
            'probability': alzheimer_probability,
            'probability_percentage': alzheimer_percentage,
            'is_high_risk': is_high_risk,
            'status_text': status_text,
            'input_features': dict(zip(required_features, input_features))
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/features', methods=['GET'])
def get_features():
    """Endpoint untuk mendapatkan daftar fitur yang dibutuhkan"""
    if model_data is not None:
        return jsonify({
            'success': True,
            'features': model_data['features'],
            'total_features': len(model_data['features'])
        }), 200
    else:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Starting Flask API on port {port}...")
    print(f"📊 Model path: {MODEL_PATH}")
    print(f"🔗 Endpoints:")
    print(f"   - GET  /health   - Health check")
    print(f"   - GET  /features - Get required features")
    print(f"   - POST /predict  - Make prediction\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)
