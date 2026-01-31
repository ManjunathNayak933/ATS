import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ApplicationForm = () => {
  const { formUrl } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cv: null
  });

  const [answers, setAnswers] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchJobDetails();
  }, [formUrl]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/public/form/${formUrl}`
      );

      if (!response.ok) {
        throw new Error('Job not found or application closed');
      }

      const data = await response.json();
      setJob(data.job);

      // Initialize answers object
      const initialAnswers = {};
      data.job.questions.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('This job posting is no longer available or the link is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        e.target.value = '';
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setFormData({ ...formData, cv: file });
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('cv', formData.cv);
      submitData.append('answers', JSON.stringify(answers));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/public/apply/${formUrl}`,
        {
          method: 'POST',
          body: submitData,
          // Don't set Content-Type header - browser will set it with boundary for FormData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Application Not Available</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Application Submitted!</h2>
          <p className="mt-4 text-gray-600">
            Thank you for applying to <strong>{job.title}</strong> at <strong>{job.company.name}</strong>.
          </p>
          <p className="mt-2 text-gray-600">
            We've received your application and will review it shortly. You'll receive a confirmation email at <strong>{formData.email}</strong>.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            We'll get back to you within 3-5 business days.
          </p>
          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {job.company.logoUrl && (
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              className="h-16 w-auto mx-auto mb-4"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{job.company.name}</p>
        </div>

        {/* Job Description */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About this role</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Application Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Form</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
                  Resume / CV <span className="text-red-600">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="cv"
                    name="cv"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, or DOCX (Max 5MB)
                  </p>
                </div>
                {formData.cv && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {formData.cv.name} ({(formData.cv.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Custom Questions */}
            {job.questions && job.questions.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Additional Questions</h3>
                
                {job.questions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {question.questionText}
                      {question.isRequired && <span className="text-red-600"> *</span>}
                    </label>
                    
                    {question.questionType === 'TEXT' && (
                      <textarea
                        required={question.isRequired}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your answer..."
                      />
                    )}

                    {question.questionType === 'RADIO' && (
                      <div className="space-y-2">
                        {/* You would need to add options field to questions table for this to work properly */}
                        <label className="flex items-center">
                          <input
                            type="radio"
                            required={question.isRequired}
                            name={question.id}
                            value="Yes"
                            checked={answers[question.id] === 'Yes'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            required={question.isRequired}
                            name={question.id}
                            value="No"
                            checked={answers[question.id] === 'No'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    )}

                    {question.questionType === 'CHECKBOX' && (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={answers[question.id] === 'true'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.checked ? 'true' : '')}
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          I agree / Yes
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Terms and Privacy */}
            <div className="pt-6 border-t border-gray-200">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the processing of my personal data and have read the{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              By submitting this form, you confirm that all information provided is accurate and complete.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by ATS Pro</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
