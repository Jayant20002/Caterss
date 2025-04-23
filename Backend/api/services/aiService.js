const axios = require('axios');
const natural = require('natural');
const Menu = require('../models/Menu');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Initialize sentiment analyzer
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");

// Menu recommendation system
const recommendMenuItems = async (userPreferences = [], orderHistory = []) => {
  try {
    // Get all menu items first
    const menuItems = await Menu.find({});
    
    // If no preferences or history, return random selection of items
    if (userPreferences.length === 0 && orderHistory.length === 0) {
      return menuItems
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    }

    // Create TF-IDF vectorizer
    const tfidf = new TfIdf();
    
    // Add user preferences to the vectorizer
    userPreferences.forEach(pref => {
      tfidf.addDocument(pref);
    });

    // Add order history to the vectorizer
    orderHistory.forEach(order => {
      tfidf.addDocument(order.items.map(item => item.name).join(' '));
    });

    // Get top terms from user preferences
    const userProfile = {};
    tfidf.listTerms(0).forEach(item => {
      userProfile[item.term] = item.tfidf;
    });

    // Calculate similarity scores with menu items
    const recommendations = menuItems.map(item => {
      const itemTerms = tokenizer.tokenize((item.name + ' ' + (item.description || '')).toLowerCase());
      let score = 0;
      
      itemTerms.forEach(term => {
        if (userProfile[term]) {
          score += userProfile[term];
        }
      });

      return {
        item,
        score
      };
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(rec => rec.item);
  } catch (error) {
    console.error('Error in menu recommendations:', error);
    return [];
  }
};

// Sentiment analysis for reviews
const analyzeReviewSentiment = (reviewText) => {
  try {
    const tokens = tokenizer.tokenize(reviewText);
    const sentiment = analyzer.getSentiment(tokens);
    
    return {
      score: sentiment,
      label: sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral',
      confidence: Math.abs(sentiment)
    };
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return {
      score: 0,
      label: 'neutral',
      confidence: 0
    };
  }
};

// Smart search with NLP
const smartSearch = async (query) => {
  try {
    const tokens = tokenizer.tokenize(query.toLowerCase());
    const menuItems = await Menu.find({});
    
    const searchResults = menuItems.map(item => {
      const itemText = (item.name + ' ' + item.description + ' ' + item.category).toLowerCase();
      let score = 0;
      
      // Calculate relevance score
      tokens.forEach(token => {
        if (itemText.includes(token)) {
          score += 1;
        }
      });

      // Add category matching bonus
      if (tokens.some(token => item.category.toLowerCase().includes(token))) {
        score += 2;
      }

      return {
        item,
        score
      };
    });

    return searchResults
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  } catch (error) {
    console.error('Error in smart search:', error);
    return [];
  }
};

module.exports = {
  recommendMenuItems,
  analyzeReviewSentiment,
  smartSearch
}; 