// AI-powered resume optimization
class ResumeOptimizer {
  constructor() {
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.apiKey = null; // Will be set from storage
  }

  async optimizeResume(jobDescription, currentResume) {
    const prompt = `
      You are an expert resume writer. Optimize the following resume for the job description provided.
      
      Job Description:
      ${jobDescription}
      
      Current Resume:
      ${JSON.stringify(currentResume, null, 2)}
      
      Please:
      1. Extract key skills and requirements from the job description
      2. Rewrite the resume to match the job requirements
      3. Use ATS-friendly formatting
      4. Include relevant keywords from the job description
      5. Keep it professional and concise
      
      Return the optimized resume in JSON format with the same structure as the input.
    `;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer and ATS optimization specialist.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const optimizedResume = JSON.parse(data.choices[0].message.content);
      return optimizedResume;
    } catch (error) {
      console.error('Resume optimization error:', error);
      return currentResume; // Return original if optimization fails
    }
  }

  extractKeywords(jobDescription) {
    // Simple keyword extraction
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd',
      'agile', 'scrum', 'machine learning', 'ai', 'data analysis',
      'sql', 'mongodb', 'postgresql', 'redis', 'microservices',
      'rest api', 'graphql', 'typescript', 'css', 'html', 'sass'
    ];

    const keywords = [];
    const lowerDescription = jobDescription.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerDescription.includes(skill)) {
        keywords.push(skill);
      }
    });

    return keywords;
  }

  generateATSResume(resumeData, keywords) {
    // Create ATS-friendly format
    const atsResume = {
      contact: {
        name: `${resumeData.firstName} ${resumeData.lastName}`,
        email: resumeData.email,
        phone: resumeData.phone,
        location: `${resumeData.city}, ${resumeData.state}`
      },
      summary: this.generateSummary(resumeData, keywords),
      skills: this.generateSkillsSection(keywords, resumeData.skills),
      experience: this.optimizeExperience(resumeData.experience, keywords),
      education: resumeData.education
    };

    return atsResume;
  }

  generateSummary(resumeData, keywords) {
    const topSkills = keywords.slice(0, 5).join(', ');
    return `Experienced ${resumeData.title || 'software developer'} with expertise in ${topSkills}. Proven track record of delivering high-quality solutions and driving business value.`;
  }

  generateSkillsSection(keywords, existingSkills) {
    const combinedSkills = [...new Set([...keywords, ...(existingSkills || [])])];
    return combinedSkills.slice(0, 12); // Keep it concise
  }

  optimizeExperience(experience, keywords) {
    return experience.map(job => ({
      ...job,
      description: this.enrichDescription(job.description, keywords)
    }));
  }

  enrichDescription(description, keywords) {
    // Add relevant keywords naturally to description
    const relevantKeywords = keywords.filter(kw => 
      !description.toLowerCase().includes(kw.toLowerCase())
    ).slice(0, 3);

    if (relevantKeywords.length > 0) {
      return `${description} Experience with ${relevantKeywords.join(', ')}.`;
    }
    return description;
  }
}