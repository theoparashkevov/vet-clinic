# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - heading "Vet Clinic Login" [level=1] [ref=e5]
      - paragraph [ref=e6]: Use the seeded demo account or any staff/admin account created by the seed script.
      - alert [ref=e7]:
        - img [ref=e9]
        - generic [ref=e11]: Your session has expired. Please sign in again.
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - text: Email
            - generic [ref=e15]: "*"
          - generic [ref=e16]:
            - textbox "Email" [ref=e17]: wrong@example.com
            - group:
              - generic: Email *
        - generic [ref=e18]:
          - generic [ref=e19]:
            - text: Password
            - generic [ref=e20]: "*"
          - generic [ref=e21]:
            - textbox "Password" [ref=e22]: wrongpassword
            - group:
              - generic: Password *
        - button "Sign in" [ref=e23] [cursor=pointer]: Sign in
  - alert [ref=e24]
```