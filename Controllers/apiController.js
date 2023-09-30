const axios = require('axios');
const _ = require('lodash');
const memoize = require('memoizee'); // Import memoizee library

// Function to fetch blog data with caching for 5 minutes
const fetchBlogData = memoize(async () => {
    const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
    const headers = {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
    };
    const response = await axios.get(apiUrl, { headers });
    return response.data.blogs;
}, { maxAge: 300000 }); // Cache duration: 5 minutes (300,000 milliseconds)

// Function to analyze blog data with caching for 5 minutes
const analyzeBlogData = memoize((blogData) => {
    const totalBlogs = blogData.length;
    const longestTitleBlog = _.maxBy(blogData, (blog) => blog.title.length);
    const privacyTitleBlogs = _.filter(blogData, (blog) =>
        blog && blog.title && blog.title.toLowerCase().includes('privacy')
    );
    const uniqueTitles = _.uniqBy(blogData, 'title').map((blog) => blog.title);

    return {
        totalBlogs,
        longestTitle: longestTitleBlog.title,
        privacyTitleCount: privacyTitleBlogs.length,
        uniqueTitles,
    };
}, { maxAge: 300000 }); // Cache duration: 5 minutes (300,000 milliseconds)

// Function to perform a case-insensitive search with caching for 5 minutes
const performSearch = memoize((blogs, paramName, paramValue) => {
    return blogs.filter((blog) => {
        const blogTitle = blog[paramName].toLowerCase();
        paramValue = paramValue.toLowerCase();
        
        // Check if the title matches completely or partially using regular expressions
        const regex = new RegExp(paramValue, 'i'); // 'i' flag for case-insensitive matching
        return regex.test(blogTitle);
    });
}, { maxAge: 300000 }); // Cache duration: 5 minutes (300,000 milliseconds)

exports.fetchingBlogDataAnalysis = async (req, res, next) => {
    try {
        // Extract and store the data
        const blogData = await fetchBlogData();

        // Analyze the data
        const analysis = analyzeBlogData(blogData);

        // Respond to the client with the statistics
        res.status(200).json({
            status: 'success',
            data: analysis,
        });
    } catch (error) {
        console.error('Error fetching or analyzing blog data:', error.message);
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

exports.blogSearch = async (req, res, next) => {
    try {
        // Get the query parameters
        const { id, image_url, title } = req.query;

        // Extract and store the data
        const blogData = await fetchBlogData();
        
        // Initialize the search results with all blogs
        let searchResults = blogData;

        // Apply search filters based on query parameters
        if (id) {
            searchResults = performSearch(searchResults, 'id', id);
        }
        if (image_url) {
            searchResults = performSearch(searchResults, 'image_url', image_url);
        }
        if (title) {
            searchResults = performSearch(searchResults, 'title', title);
        }

        // Respond with the search results
        res.status(200).json({
            status: 'success',
            data: {
                searchResults 
            } 
        });
    } catch (error) {
        console.error('Error during blog search:', error.message);
        res.status(500).json({ 
            status: 'failed',
            error 
        });
    }
};
