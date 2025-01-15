import Index from '../../src/pages/Index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
describe('Delivery Price Calculator', () => {
  beforeEach(() => {

    
    // Create a new QueryClient for each test
    cy.stub(toast, 'error').as('toastError');
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });

    // Mock geolocation
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
        return cb({
          coords: {
            latitude: 60.1699,
            longitude: 24.9384,
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          }
        });
      });
    });
    
    
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Index />
      </QueryClientProvider>
    );
  });


  it('should show error for missing location', () => {
    cy.get('[data-test-id="cartValue"]').type('10.50');
    cy.contains('button', 'Calculate Price').click();
    cy.get('@toastError').should('have.been.calledWith', 
      'Please allow access to your location to calculate the delivery price.'
    );
  });

  it('should show error for invalid cart value', () => {
    cy.get('[data-test-id="getLocation"]').click();
    cy.get('[data-test-id="cartValue"]').type('-1');
    cy.contains('button', 'Calculate Price').click();
    cy.get('@toastError').should('have.been.calledWith', 
      'Please enter a valid cart value (e.g., 10.50).'
    );
  });

  it('should load initial state correctly', () => {
    cy.get('[data-test-id="venueSlug"]').should('have.value', 'home-assignment-venue-helsinki-static');
    cy.get('[data-test-id="cartValue"]').should('have.value', '');
    cy.get('[data-test-id="userLatitude"]').should('have.value', '');
    cy.get('[data-test-id="userLongitude"]').should('have.value', '');
  });

  it('should handle location retrieval', () => {
    cy.get('[data-test-id="getLocation"]').click();
    cy.get('[data-test-id="userLatitude"]').should('have.value', '60.1699');
    cy.get('[data-test-id="userLongitude"]').should('have.value', '24.9384');
  });

  it('should calculate delivery price', () => {
    // Set values
    cy.get('[data-test-id="venueSlug"]').select('home-assignment-venue-helsinki-static');
    cy.get('[data-test-id="cartValue"]').type('10.50');
    cy.get('[data-test-id="getLocation"]').click();

    // Calculate
    cy.contains('button', 'Calculate Price').click();

    // Verify price breakdown appears
    cy.contains('Price Breakdown').should('be.visible');
    cy.contains('Cart Value:').should('be.visible');
    cy.contains('Delivery Fee:').should('be.visible');
    cy.contains('Total Price:').should('be.visible');
  });

});