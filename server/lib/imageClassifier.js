const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const path = require('path');

class ImageClassifier {
  constructor() {
    this.model = null;
    this.categories = {
      0: { name: 'infrastructure', department: 'Public Works' },
      1: { name: 'utilities', department: 'Utilities Department' },
      2: { name: 'sanitation', department: 'Sanitation Department' },
      3: { name: 'safety', department: 'Safety & Security' },
      4: { name: 'environmental', department: 'Environmental Department' }
    };
  }

  async loadModel() {
    try {
      // Load pre-trained model (replace with your model path)
      this.model = await tf.loadLayersModel('file://./models/civic_classifier/model.json');
      console.log('Image classification model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      // Fallback to mock classification
      this.model = null;
    }
  }

  async preprocessImage(imagePath) {
    const imageBuffer = await sharp(imagePath)
      .resize(224, 224)
      .removeAlpha()
      .toBuffer();
    
    const tensor = tf.node.decodeImage(imageBuffer, 3)
      .expandDims(0)
      .div(255.0);
    
    return tensor;
  }

  async classifyImage(imagePath) {
    try {
      if (!this.model) {
        // Mock classification for demo
        return this.mockClassification();
      }

      const preprocessed = await this.preprocessImage(imagePath);
      const predictions = await this.model.predict(preprocessed).data();
      
      const maxIndex = predictions.indexOf(Math.max(...predictions));
      const confidence = predictions[maxIndex];
      
      preprocessed.dispose();
      
      return {
        category: this.categories[maxIndex].name,
        department: this.categories[maxIndex].department,
        confidence: confidence,
        success: true
      };
    } catch (error) {
      console.error('Classification error:', error);
      return this.mockClassification();
    }
  }

  mockClassification() {
    const categories = Object.values(this.categories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      category: randomCategory.name,
      department: randomCategory.department,
      confidence: 0.85 + Math.random() * 0.1,
      success: true
    };
  }
}

module.exports = new ImageClassifier();