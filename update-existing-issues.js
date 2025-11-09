const mongoose = require('mongoose');
require('dotenv').config();

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  municipalityId: String,
  municipalityName: String,
  pincode: String,
  detectionMethod: String,
  geoLocation: {
    latitude: Number,
    longitude: Number
  }
}, { strict: false });

const Issue = mongoose.model('Issue', issueSchema);

async function updateExistingIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const assignMunicipality = (geoLocation, location) => {
      const municipalityBounds = {
        'CBE001': {
          name: 'Coimbatore Corporation',
          bounds: { north: 11.1, south: 10.9, east: 77.1, west: 76.8 },
          pincode: '641001'
        },
        'CHN001': {
          name: 'Chennai Corporation', 
          bounds: { north: 13.2, south: 12.8, east: 80.3, west: 80.1 },
          pincode: '600001'
        },
        'MDU001': {
          name: 'Madurai Corporation',
          bounds: { north: 9.95, south: 9.85, east: 78.2, west: 78.0 },
          pincode: '625001'
        }
      };

      // Check GPS coordinates
      if (geoLocation?.latitude && geoLocation?.longitude) {
        const lat = parseFloat(geoLocation.latitude);
        const lng = parseFloat(geoLocation.longitude);
        
        for (const [munId, data] of Object.entries(municipalityBounds)) {
          const bounds = data.bounds;
          if (lat >= bounds.south && lat <= bounds.north && 
              lng >= bounds.west && lng <= bounds.east) {
            return {
              municipalityId: munId,
              municipalityName: data.name,
              pincode: data.pincode,
              detectionMethod: 'GPS'
            };
          }
        }
      }

      // Check location text
      const locationText = location?.toLowerCase() || '';
      if (locationText.includes('coimbatore') || locationText.includes('641')) {
        return {
          municipalityId: 'CBE001',
          municipalityName: 'Coimbatore Corporation',
          pincode: '641001',
          detectionMethod: 'Location Text'
        };
      }
      if (locationText.includes('chennai') || locationText.includes('600')) {
        return {
          municipalityId: 'CHN001',
          municipalityName: 'Chennai Corporation', 
          pincode: '600001',
          detectionMethod: 'Location Text'
        };
      }
      if (locationText.includes('madurai') || locationText.includes('625')) {
        return {
          municipalityId: 'MDU001',
          municipalityName: 'Madurai Corporation',
          pincode: '625001', 
          detectionMethod: 'Location Text'
        };
      }

      return null;
    };

    const issues = await Issue.find({ municipalityId: { $exists: false } });
    console.log(`Found ${issues.length} issues without municipality assignment`);

    let updated = 0;
    for (const issue of issues) {
      const municipalityInfo = assignMunicipality(issue.geoLocation, issue.location);
      if (municipalityInfo) {
        await Issue.updateOne(
          { _id: issue._id },
          {
            municipalityId: municipalityInfo.municipalityId,
            municipalityName: municipalityInfo.municipalityName,
            pincode: municipalityInfo.pincode,
            detectionMethod: municipalityInfo.detectionMethod
          }
        );
        updated++;
        console.log(`Updated issue: ${issue.title} -> ${municipalityInfo.municipalityName}`);
      }
    }

    console.log(`✅ Updated ${updated} issues with municipality assignments`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateExistingIssues();