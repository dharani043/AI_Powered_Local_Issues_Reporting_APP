const imageClassifier = require('./imageClassifier');

class DepartmentRouter {
  constructor() {
    this.departmentContacts = {
      'Public Works': {
        email: 'publicworks@municipality.gov',
        priority: 'high',
        avgResponseTime: '24 hours'
      },
      'Utilities Department': {
        email: 'utilities@municipality.gov',
        priority: 'critical',
        avgResponseTime: '12 hours'
      },
      'Sanitation Department': {
        email: 'sanitation@municipality.gov',
        priority: 'medium',
        avgResponseTime: '48 hours'
      },
      'Safety & Security': {
        email: 'safety@municipality.gov',
        priority: 'critical',
        avgResponseTime: '6 hours'
      },
      'Environmental Department': {
        email: 'environment@municipality.gov',
        priority: 'medium',
        avgResponseTime: '72 hours'
      }
    };
  }

  async routeIssue(imagePath, issueData) {
    try {
      const classification = await imageClassifier.classifyImage(imagePath);
      
      if (!classification.success) {
        return this.getDefaultRouting(issueData);
      }

      const department = this.departmentContacts[classification.department];
      
      return {
        category: classification.category,
        department: classification.department,
        contact: department.email,
        priority: this.calculatePriority(classification, issueData),
        confidence: classification.confidence,
        estimatedResponse: department.avgResponseTime,
        autoRouted: true
      };
    } catch (error) {
      console.error('Routing error:', error);
      return this.getDefaultRouting(issueData);
    }
  }

  calculatePriority(classification, issueData) {
    const basePriority = this.departmentContacts[classification.department].priority;
    const confidence = classification.confidence;
    
    // Adjust priority based on confidence and user input
    if (confidence > 0.9 && issueData.userPriority === 'high') {
      return 'critical';
    }
    
    return issueData.userPriority || basePriority;
  }

  getDefaultRouting(issueData) {
    return {
      category: issueData.category || 'general',
      department: 'General Administration',
      contact: 'admin@municipality.gov',
      priority: issueData.userPriority || 'medium',
      confidence: 0.5,
      estimatedResponse: '48 hours',
      autoRouted: false
    };
  }
}

module.exports = new DepartmentRouter();