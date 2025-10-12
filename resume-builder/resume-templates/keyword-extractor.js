// Extract skill/tech keywords from raw JD text – no external deps
const KeywordExtractor = (() => {
  // Core tech lexicon (expand at will)
  const LEXICON = [
    'javascript','typescript','python','java','kotlin','swift','go','rust','c++','c#',
    'react','angular','vue','svelte','node.js','express','nestjs','next.js','nuxt',
    'docker','kubernetes','terraform','ansible','aws','azure','gcp','ci/cd','jenkins',
    'git','mongodb','postgresql','mysql','redis','kafka','elasticsearch','graphql',
    'rest api','microservices','serverless','machine learning','deep learning','ai',
    'scrum','agile','devops','blockchain','solidity','web3','pandas','numpy','tensorflow'
  ];

  const extract = (jd, { topN = 15, minLen = 2 } = {}) => {
    const words = jd.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(w => w.length >= minLen);

    const freq = {};
    words.forEach(w => freq[w] = (freq[w]||0)+1);

    // Score = lexicon hit (x3) + frequency
    const scored = Object.entries(freq)
      .map(([w, f]) => ({ word: w, score: f * (LEXICON.includes(w)?3:1) }))
      .sort((a,b) => b.score - a.score);

    return scored.slice(0, topN).map(x => x.word);
  };

  return { extract };
})();