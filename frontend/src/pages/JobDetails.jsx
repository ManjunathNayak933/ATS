import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch job');
      
      const data = await response.json();
      setJob(data.job);
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const handleBulkAction = async (action, reason = null) => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedCandidates.length} candidate(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/candidates/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          status: action,
          rejectionReason: reason
        })
      });

      if (!response.ok) throw new Error('Failed to update candidates');

      // Refresh candidates
      await fetchJobDetails();
      setSelectedCandidates([]);
      setShowBulkActions(false);
      alert(`Successfully ${action.toLowerCase()} ${selectedCandidates.length} candidate(s)`);
    } catch (error) {
      console.error('Error updating candidates:', error);
      alert('Failed to update candidates');
    }
  };

  const copyFormLink = () => {
    const fullUrl = `${window.location.origin}/apply/${job.formUrl}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Application form link copied to clipboard!');
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/jobs')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {candidates.length} applicant{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={copyFormLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Form
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Job Details */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                    job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    job.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{job.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Assigned HR</p>
                  <p className="mt-1 font-medium text-gray-900">{job.hr?.name}</p>
                  <p className="text-sm text-gray-600">{job.hr?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="mt-1 text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Application Questions</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-gray-500">Default fields:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Name, Email, Phone</li>
                      <li>• CV Upload</li>
                    </ul>
                    {job.questions && job.questions.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 mt-3">Custom questions:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {job.questions.map((q, idx) => (
                            <li key={idx}>• {q.questionText}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Candidates */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Candidates Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Candidates ({candidates.length})
                  </h2>
                  
                  {selectedCandidates.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedCandidates.length} selected
                      </span>
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Bulk Actions
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Actions Dropdown */}
                {showBulkActions && selectedCandidates.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <button
                      onClick={() => handleBulkAction('APPROVED')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Approve Selected ({selectedCandidates.length})
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason (optional):');
                        handleBulkAction('REJECTED', reason);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Reject Selected ({selectedCandidates.length})
                    </button>
                  </div>
                )}

                {/* Select All */}
                {candidates.length > 0 && (
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.length === candidates.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Select All</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Candidates List */}
              <div className="divide-y divide-gray-200">
                {candidates.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Share the application form to start receiving candidates
                    </p>
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <CandidateStrip
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={selectedCandidates.includes(candidate.id)}
                      onSelect={() => handleCandidateSelect(candidate.id)}
                      onStatusChange={() => fetchJobDetails()}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Candidate Strip Component
const CandidateStrip = ({ candidate, isSelected, onSelect, onStatusChange, onClick }) => {
  const [updating, setUpdating] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  const handleStatusChange = async (newStatus, reason = null) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidates/${candidate.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus, rejectionReason: reason })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      onStatusChange();
      setShowRejectReason(false);
      alert(`Candidate ${newStatus.toLowerCase()} successfully. Email sent.`);
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate status');
    } finally {
      setUpdating(false);
    }
  };

  const downloadCV = (e) => {
    e.stopPropagation();
    window.open(candidate.cvUrl, '_blank');
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div
      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Avatar */}
        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold">
            {candidate.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{candidate.name}</p>
            {candidate.aiMatchScore && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${getMatchScoreColor(candidate.aiMatchScore)}`}>
                {candidate.aiMatchScore}% Match
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{candidate.email}</p>
          <p className="text-xs text-gray-500">
            Applied {new Date(candidate.appliedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {/* Download CV */}
          <button
            onClick={downloadCV}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Download CV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Status Dropdown */}
          <select
            value={candidate.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              if (newStatus === 'REJECTED') {
                setShowRejectReason(true);
              } else {
                handleStatusChange(newStatus);
              }
            }}
            disabled={updating}
            className={`px-3 py-1 text-sm rounded-lg border-2 font-medium ${getStatusBadge(candidate.status)} border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectReason && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm font-medium text-red-900 mb-2">Rejection Reason</p>
          <div className="space-y-2">
            <button
              onClick={() => handleStatusChange('REJECTED', 'Agreed with AI analysis')}
              className="w-full px-3 py-2 text-sm bg-white border border-red-300 rounded-lg hover:bg-red-50 text-left"
            >
              Agreed with AI analysis
            </button>
            <button
              onClick={() => {
                const reason = prompt('Please enter rejection reason:');
                if (reason) {
                  handleStatusChange('REJECTED', reason);
                } else {
                  setShowRejectReason(false);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-red-300 rounded-lg hover:bg-red-50 text-left"
            >
              Other reason (specify)
            </button>
            <button
              onClick={() => setShowRejectReason(false)}
              className="w-full px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
