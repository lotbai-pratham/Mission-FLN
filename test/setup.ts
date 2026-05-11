import '@testing-library/jest-dom'

// Mock scrollIntoView since JSDOM doesn't implement it
Element.prototype.scrollIntoView = () => {};

