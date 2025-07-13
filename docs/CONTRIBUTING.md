# Contributing to Amplimentor

Thank you for your interest in contributing to Amplimentor! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/amplimentor.git
   cd amplimentor
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd ../backend
   cp env.example .env
   # Edit .env with your development values
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## Development Guidelines

### Code Style

#### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Maximum line length: 80 characters

#### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM methodology for CSS
- Use CSS Grid and Flexbox for layouts
- Mobile-first responsive design
- Validate HTML and CSS

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear commit messages
   - Keep commits atomic and focused
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user profile photo upload functionality"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description
   - Include screenshots if UI changes
   - Reference related issues

### Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(api): resolve session timeout issue
docs(readme): update installation instructions
```

## Project Structure

### Backend Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── uploads/         # File uploads
└── server.js        # Main server file
```

### Frontend Structure
```
frontend/
├── pages/           # HTML pages
├── css/             # Stylesheets
├── js/              # JavaScript files
├── images/          # Static images
└── assets/          # Other assets
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
- Test all pages in different browsers
- Test responsive design
- Validate forms and user interactions

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile updates
- [ ] Session creation and management
- [ ] Payment processing
- [ ] File uploads
- [ ] Chat functionality
- [ ] Mobile responsiveness

## API Development

### Adding New Endpoints

1. **Create route file** (if needed)
   ```javascript
   // routes/new-feature.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/new-endpoint', async (req, res) => {
     // Implementation
   });
   
   module.exports = router;
   ```

2. **Add to server.js**
   ```javascript
   const newFeatureRoutes = require('./routes/new-feature');
   app.use('/api/new-feature', newFeatureRoutes);
   ```

3. **Update API documentation**
   - Add endpoint to `docs/API.md`
   - Include request/response examples

### Database Models

When creating new models:
1. Follow existing naming conventions
2. Add proper validation
3. Include timestamps
4. Add indexes for performance
5. Document the schema

## Frontend Development

### Adding New Pages

1. **Create HTML file**
   ```html
   <!-- pages/new-page.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>New Page - Amplimentor</title>
       <link rel="stylesheet" href="../css/style.css">
   </head>
   <body>
       <!-- Content -->
       <script src="../js/main.js"></script>
   </body>
   </html>
   ```

2. **Add navigation links**
3. **Update CSS if needed**
4. **Test responsiveness**

### JavaScript Guidelines

- Use modern ES6+ syntax
- Handle errors gracefully
- Validate user input
- Use async/await for API calls
- Add loading states

## Security Guidelines

### Backend Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement rate limiting
- Secure file uploads
- Use HTTPS in production

### Frontend Security
- Validate forms client-side
- Sanitize user inputs
- Use HTTPS for API calls
- Implement CSRF protection
- Secure session handling

## Performance Guidelines

### Backend Performance
- Use database indexes
- Implement caching
- Optimize database queries
- Use compression
- Monitor memory usage

### Frontend Performance
- Optimize images
- Minify CSS/JS
- Use CDN for assets
- Implement lazy loading
- Reduce HTTP requests

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Update README files

### API Documentation
- Keep `docs/API.md` updated
- Include request/response examples
- Document error codes
- Add authentication requirements

## Issue Reporting

### Bug Reports
When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Error messages/logs

### Feature Requests
When requesting features:
- Clear description of the feature
- Use case and benefits
- Mockups or examples
- Implementation suggestions

## Pull Request Process

1. **Ensure your code follows guidelines**
2. **Add tests if applicable**
3. **Update documentation**
4. **Test thoroughly**
5. **Create descriptive PR**
6. **Respond to review comments**

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Code Review

### Review Guidelines
- Be constructive and respectful
- Focus on code quality
- Suggest improvements
- Check for security issues
- Verify functionality

### Review Checklist
- [ ] Code is readable and maintainable
- [ ] Security best practices followed
- [ ] Performance considerations
- [ ] Error handling
- [ ] Documentation updated

## Getting Help

### Resources
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Issue Tracker](https://github.com/yourusername/amplimentor/issues)

### Communication
- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions
- Be respectful and inclusive

## License

By contributing to Amplimentor, you agree that your contributions will be licensed under the ISC License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Amplimentor! 🚀 