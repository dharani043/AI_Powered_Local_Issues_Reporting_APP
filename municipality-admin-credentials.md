# Municipality Admin Credentials

## Created Municipality Admins

### Chennai Corporation
- **Email:** admin@chennai.gov.in
- **Password:** chennai123
- **Municipality ID:** CHN001
- **Pincode:** 600001

### Coimbatore Corporation
- **Email:** admin@coimbatore.gov.in
- **Password:** coimbatore123
- **Municipality ID:** CBE001
- **Pincode:** 641001

### Madurai Corporation
- **Email:** admin@madurai.gov.in
- **Password:** madurai123
- **Municipality ID:** MDU001
- **Pincode:** 625001

### Trichy Corporation
- **Email:** admin@trichy.gov.in
- **Password:** trichy123
- **Municipality ID:** TRY001
- **Pincode:** 620001

### Salem Corporation
- **Email:** admin@salem.gov.in
- **Password:** salem123
- **Municipality ID:** SLM001
- **Pincode:** 636001

## How to Create Admins

1. Start the server
2. Make a POST request to: `http://localhost:5000/api/auth/create-municipality-admins`
3. Or use the municipality admin login page with the credentials above

## Municipality Mapping

Issues are automatically mapped to municipalities based on location/pincode:
- 600xxx → Chennai (CHN001)
- 641xxx → Coimbatore (CBE001)
- 625xxx → Madurai (MDU001)
- 620xxx → Trichy (TRY001)
- 636xxx → Salem (SLM001)