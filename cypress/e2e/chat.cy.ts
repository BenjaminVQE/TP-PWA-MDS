describe('Chat Flow', () => {
    beforeEach(() => {
        // Clear local storage to start fresh
        cy.clearLocalStorage();
        cy.visit('http://localhost:3000/reception');
    });

    it('allows a user to join a room and send a message', () => {
        // 1. Enter Pseudo
        cy.get('input[placeholder="Votre pseudo..."]').type('CypressUser');

        // 2. Click "Choisir ce pseudo" (Assuming button text or selector)
        // Finding button by text since exact ID might not be there
        cy.contains('button', 'Continuer').click();

        // 3. Select Room
        // Assuming "Général" is default or present. 
        // If we need to create one, we might need to type in the "Nouveau salon" input
        cy.get('input[placeholder="Nouveau salon..."]').type('CypressRoom');
        cy.contains('button', 'Créer').click();

        // 4. Verify redirection
        cy.url().should('include', '/room/CypressRoom');

        // 5. Send Message
        cy.get('input[placeholder="Type a message..."]').type('Hello form E2E');
        cy.contains('button', '➤').click();

        // 6. Verify Message
        cy.contains('Hello form E2E').should('be.visible');
        cy.contains('CypressUser').should('be.visible');
    });
});
