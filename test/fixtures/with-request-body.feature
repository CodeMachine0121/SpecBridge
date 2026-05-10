Feature: Request body scenario

  Scenario: Create user
    When I send a "POST" request to "/api/users"
    And the request body is:
      """
      { "name": "Alice", "email": "alice@example.com" }
      """
    Then the response status should be 201
