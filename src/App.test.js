import React from 'react';
import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders the header image and the footer links', () => {
    render(<App />);

    expect(within(screen.getByRole('banner')).getByAltText('Scape')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    ['EMAIL', 'LINKEDIN', 'RESUME', 'GITHUB'].forEach((label) => {
        expect(footer).toHaveTextContent(label);
    });
});
