Feature: Status code scenario

  Scenario: Get user
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200
