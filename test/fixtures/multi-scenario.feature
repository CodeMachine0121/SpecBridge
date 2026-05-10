Feature: Multi-scenario

  Scenario: Health check
    When I send a "GET" request to "/api/health"
    Then the response status should be 200

  Scenario: Get user
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200

  Scenario: Create user
    When I send a "POST" request to "/api/users"
    And the request body is:
      """
      { "name": "Bob" }
      """
    Then the response status should be 201
