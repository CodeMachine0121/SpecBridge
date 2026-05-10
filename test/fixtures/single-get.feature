Feature: Single GET scenario

  Scenario: Health check
    When I send a "GET" request to "/api/health"
    Then the response status should be 200
