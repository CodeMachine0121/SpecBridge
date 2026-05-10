Feature: Field assertions scenario

  Scenario: Check user fields
    When I send a "GET" request to "/api/users/1"
    Then the response status should be 200
    Then the response body should contain field "name" with value "John"
    Then the response body should contain field "email" with value "john@example.com"
