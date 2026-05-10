Feature: Response body exact scenario

  Scenario: Get user details
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200
    Then the response body should be:
      """
      { "id": 1, "name": "John" }
      """
