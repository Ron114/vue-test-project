# Vue.js Data Grid Application with Pinia Stores

A modern Vue.js 3 application featuring a powerful data grid with Pinia state management, custom table support, and API integration.

## Features

- **Data Grid**: Advanced table with sorting, filtering, pagination, and column pinning
- **Pinia Stores**: Modern state management with reactive stores
- **Custom Tables**: Create and manage custom table configurations
- **API Integration**: Real-time data fetching from external APIs
- **Responsive Design**: Built with Tailwind CSS for modern UI/UX

## API Integration

The application integrates with the following API endpoint:

### Base URL
```
https://srv03.nopcoders.com
```

### Custom Tables API
- **Endpoint**: `GET /dtables/list`
- **Purpose**: Fetch all custom table configurations
- **Response**: JSON array of table configs with the following structure:

```json
[
  {
    "id": <int>,              // config_id for fetching a custom table
    "user_id": <int>,
    "name": <string>,
    "internal_table": <string>,
    "created_at": <timestamp>
  }
]
```

## Store Architecture

### Custom Tables Store (`src/stores/customTables.js`)
- **State**: `customTables`, `loading`, `error`, `lastFetched`
- **Actions**: `fetchCustomTables()`, `refreshCustomTables()`, `getCustomTableById()`
- **Features**: 
  - Automatic caching (5-minute TTL)
  - Error handling with fallback to mock data
  - Network timeout protection (10 seconds)
  - Data validation and transformation

### Entities Store (`src/stores/entities.js`)
- **State**: `entities`, `searchTerm`, `columnFilters`, `sortBy`, `sortDir`, `currentPage`
- **Actions**: `fetchEntities()`, `setSearchTerm()`, `setColumnFilter()`, `setSort()`
- **Features**: 
  - Global and column-specific filtering
  - Multi-column sorting
  - Pagination with configurable page sizes

## Usage

### Switching Views
1. **Entities View**: Default view showing entity data with search and filtering
2. **Custom Tables View**: Select from available custom table configurations

### Creating Custom Tables
1. Select rows in the Entities view
2. Click "Create Custom Table" button
3. Configure table settings in the modal
4. Save to create a new custom table configuration

### API Error Handling
The application includes robust error handling:
- Network timeouts (10 seconds)
- CORS error detection
- Network connectivity issues
- Invalid API responses
- Fallback to mock data for development

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── DataGrid.vue    # Main data grid component
│   ├── DataSetSwitcher.vue # View switcher
│   ├── PaginationBar.vue   # Pagination controls
│   └── ...
├── stores/              # Pinia stores
│   ├── customTables.js # Custom tables management
│   └── entities.js     # Entity data management
├── assets/              # Static assets
└── main.js             # Application entry point
```

## Technologies Used

- **Vue.js 3**: Progressive JavaScript framework
- **Pinia**: Vue state management library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server

## API Configuration

The API base URL is configured in the `customTables.js` store:

```javascript
const API_BASE_URL = 'https://srv03.nopcoders.com'
```

To change the API endpoint, update this constant in the store file.

## Error Handling

The application gracefully handles various error scenarios:
- **API Unavailable**: Falls back to mock data
- **Network Issues**: Shows user-friendly error messages
- **Invalid Data**: Validates and filters malformed responses
- **Timeouts**: Prevents hanging requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
