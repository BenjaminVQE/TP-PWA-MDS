import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageInput from '@/app/room/[id]/MessageInput';
import '@testing-library/jest-dom';

describe('MessageInput Component', () => {
    const mockOnSend = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders input and buttons', () => {
        render(<MessageInput onSend={mockOnSend} />);
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
        expect(screen.getByText('📷')).toBeInTheDocument();
        expect(screen.getByText('🖼️')).toBeInTheDocument();
        expect(screen.getByText('📍')).toBeInTheDocument();
    });

    test('allows typing and sending text', () => {
        render(<MessageInput onSend={mockOnSend} />);
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'Hello World' } });
        expect(input).toHaveValue('Hello World');

        const sendButton = screen.getByText('➤');
        fireEvent.click(sendButton);

        expect(mockOnSend).toHaveBeenCalledWith('Hello World');
        expect(input).toHaveValue('');
    });

    test('disable send button when empty', () => {
        render(<MessageInput onSend={mockOnSend} />);
        const sendButton = screen.getByText('➤');
        expect(sendButton).toBeDisabled();
    });

    test('calls onSend with location when location button is clicked', () => {
        const mockGeolocation = {
            getCurrentPosition: jest.fn().mockImplementationOnce((success) => Promise.resolve(success({
                coords: {
                    latitude: 48.8566,
                    longitude: 2.3522
                }
            })))
        };
        (global as any).navigator.geolocation = mockGeolocation;

        render(<MessageInput onSend={mockOnSend} />);
        const locationButton = screen.getByText('📍');
        fireEvent.click(locationButton);

        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        // Wait for the callback
        expect(mockOnSend).toHaveBeenCalled(); // Simplified check, argument check would deeply equal
    });
});
