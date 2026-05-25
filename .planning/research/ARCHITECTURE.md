# Architecture Notes

```mermaid
flowchart TD
  A["WhatsApp inbound event"] --> B["Inbound normalizer"]
  B --> C["Consent gate"]
  C --> D["Document classifier"]
  D --> E["Crof/Nahcrof extractor"]
  E --> F["Schema validation"]
  F --> G["Drug and lab validation"]
  G --> H["Deterministic risk engine"]
  H --> I["Draft explanation"]
  I --> J{"Risk path"}
  J -->|Green| K["Auto delivery plan"]
  J -->|Yellow| L["Pharmacist review task"]
  J -->|Red| M["Doctor or urgent review task"]
  L --> N["Reviewed script"]
  M --> N
  K --> O["TTS and WhatsApp delivery"]
  N --> O
  O --> P["Audit log and family memory"]
```

The pipeline should stay modular. Provider-specific code belongs at the edges: extraction providers, TTS providers, WhatsApp providers, database adapter, and object storage adapter.

