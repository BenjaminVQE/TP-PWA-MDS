import { saveMessage, getUser, saveUser, getRooms, saveRoom } from '@/lib/storage';
import { Message, User, Room } from '@/lib/types';

describe('Storage Utils', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save and retrieve user', () => {
        const user: User = { id: '1', pseudo: 'TestUser', photoUrl: 'test.jpg' };
        saveUser(user);
        expect(getUser()).toEqual(user);
    });

    test('should return null if no user', () => {
        expect(getUser()).toBeNull();
    });

    test('should update room lastActivity on saveMessage', () => {
        // First create a room
        const room: Room = { id: 'room1', name: 'General', lastActivity: 0 };
        saveRoom(room);

        const msg: Message = {
            roomId: 'room1',
            senderName: 'TestUser',
            content: 'Hello',
            timestamp: 12345,
            imageUrl: undefined,
            location: undefined
        };
        saveMessage(msg);

        const updatedRooms = getRooms();
        const updatedRoom = updatedRooms.find(r => r.id === 'room1');

        expect(updatedRoom).toBeDefined();
        expect(updatedRoom?.lastMessage).toBe('Hello');
        expect(updatedRoom?.lastActivity).toBe(12345);
    });

    test('should save and retrieve rooms', () => {
        const room: Room = { id: 'room1', name: 'General', lastActivity: 123 };
        saveRoom(room);
        const rooms = getRooms();
        expect(rooms).toHaveLength(1);
        expect(rooms[0]).toEqual(room);
    });
});
