Feature: API Contract Verification

  Scenario: Health check endpoint
    When I send a "GET" request to "/api/health"
    Then the response status should be 200
    Then the response body should contain field "status" with value "ok"

  Scenario: Get user by ID
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200
    Then the response body should be:
      """
      { "id": 1, "name": "John" }
      """

  Scenario: Create a new user
    When I send a "POST" request to "/api/users"
    And the request body is:
      """
      { "name": "Alice", "email": "alice@example.com" }
      """
    Then the response status should be 201
    Then the response body should contain field "name" with value "Alice"
