import * as XLSX from 'xlsx'

class LocalDatabaseService {
    constructor() {
        this.databasePath = typeof window !== 'undefined' ? '/database.xlsx' : './public/database.xlsx'
        this.cachedData = null
        this.lastLoadTime = null
        this.cacheExpiry = 5 * 60 * 1000 // 5 minutes cache
    }

    // Load data from the local Excel database
    async loadDatabase(forceRefresh = false) {
        // Check if we have valid cached data
        if (!forceRefresh && this.cachedData && this.lastLoadTime) {
            const timeSinceLastLoad = Date.now() - this.lastLoadTime
            if (timeSinceLastLoad < this.cacheExpiry) {
                return this.cachedData
            }
        }

        try {
            let arrayBuffer

            if (typeof window !== 'undefined') {
                // Browser environment - fetch the file
                const response = await fetch(this.databasePath)
                if (!response.ok) {
                    throw new Error(`Failed to load database: ${response.status} ${response.statusText}`)
                }
                arrayBuffer = await response.arrayBuffer()
            } else {
                const fs = await import('fs')
                const path = await import('path')
                const filePath = path.resolve(this.databasePath)

                if (!fs.existsSync(filePath)) {
                    throw new Error(`Database file not found: ${filePath}`)
                }

                const fileBuffer = fs.readFileSync(filePath)
                arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength)
            }

            const workbook = XLSX.read(arrayBuffer, { type: 'array' })

            const data = this.processWorkbook(workbook)

            // Cache the data
            this.cachedData = data
            this.lastLoadTime = Date.now()

            return data
        } catch (error) {
            console.error('Error loading local database:', error)
            throw error
        }
    }

    // Process the Excel workbook and extract entities and custom tables
    processWorkbook(workbook) {
        const result = {
            entities: [],
            customTables: [],
            customTableColumns: [],
            customTableData: []
        }

        // Get sheet names
        const sheetNames = workbook.SheetNames

        // Process each sheet
        sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (jsonData.length === 0) return

            // Determine sheet type based on content or name
            if (this.isEntitiesSheet(sheetName, jsonData)) {
                result.entities = this.processEntitiesSheet(jsonData)
            } else if (this.isCustomTablesSheet(sheetName, jsonData)) {
                result.customTables = this.processCustomTablesSheet(jsonData)
            } else if (this.isCustomTableColumnsSheet(sheetName, jsonData)) {
                result.customTableColumns = this.processCustomTableColumnsSheet(jsonData)
            } else if (this.isCustomTableDataSheet(sheetName, jsonData)) {
                result.customTableData = this.processCustomTableDataSheet(jsonData)
            }
        })

        // If no specific sheets found, try to auto-detect from first sheet
        if (result.entities.length === 0 && sheetNames.length > 0) {
            const firstSheet = workbook.Sheets[sheetNames[0]]
            const firstSheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            result.entities = this.autoDetectEntities(firstSheetData)
        }

        return result
    }

    // Check if a sheet contains entities data
    isEntitiesSheet(sheetName, data) {
        if (data.length < 2) return false

        const headers = data[0]
        const expectedHeaders = ['registration_id', 'legal_name', 'status', 'address', 'last_scan']
        const hasExpectedHeaders = expectedHeaders.some(header =>
            headers.some(h => h && h.toString().toLowerCase().includes(header))
        )

        return hasExpectedHeaders || sheetName.toLowerCase().includes('entity') || sheetName.toLowerCase().includes('company')
    }

    // Check if a sheet contains custom tables data
    isCustomTablesSheet(sheetName, data) {
        if (data.length < 2) return false

        const headers = data[0]
        const expectedHeaders = ['config_id', 'table_name', 'name', 'id']
        const hasExpectedHeaders = expectedHeaders.some(header =>
            headers.some(h => h && h.toString().toLowerCase().includes(header))
        )

        return hasExpectedHeaders || sheetName.toLowerCase().includes('table') || sheetName.toLowerCase().includes('custom')
    }

    // Check if a sheet contains custom table columns data
    isCustomTableColumnsSheet(sheetName, data) {
        if (data.length < 2) return false

        const headers = data[0]
        const expectedHeaders = ['key', 'label', 'width', 'name', 'field']
        const hasExpectedHeaders = expectedHeaders.some(header =>
            headers.some(h => h && h.toString().toLowerCase().includes(header))
        )

        return hasExpectedHeaders || sheetName.toLowerCase().includes('column') || sheetName.toLowerCase().includes('field')
    }

    // Check if a sheet contains custom table data
    isCustomTableDataSheet(sheetName, data) {
        if (data.length < 2) return false

        const headers = data[0]
        const expectedHeaders = ['id', 'name', 'value', 'field']
        const hasExpectedHeaders = expectedHeaders.some(header =>
            headers.some(h => h && h.toString().toLowerCase().includes(header))
        )

        return hasExpectedHeaders || sheetName.toLowerCase().includes('data') || sheetName.toLowerCase().includes('value')
    }

    // Process entities sheet data
    processEntitiesSheet(data) {
        if (data.length < 2) return []

        const headers = data[0]
        const entities = []

        // Find column indices for expected fields
        const columnMap = this.mapColumns(headers, [
            'registration_id', 'legal_name', 'status', 'address', 'last_scan'
        ])

        for (let i = 1; i < data.length; i++) {
            const row = data[i]
            if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined)) continue

            const entity = {
                registration_id: this.getCellValue(row, columnMap.registration_id) || '',
                legal_name: this.getCellValue(row, columnMap.legal_name) || '',
                status: this.getCellValue(row, columnMap.status) || '',
                address: this.getCellValue(row, columnMap.address) || '',
                last_scan: this.getCellValue(row, columnMap.last_scan) || ''
            }

            // Only add if we have at least a registration_id or legal_name
            if (entity.registration_id || entity.legal_name) {
                entities.push(entity)
            }
        }

        return entities
    }

    // Process custom tables sheet data
    processCustomTablesSheet(data) {
        if (data.length < 2) return []

        const headers = data[0]
        const tables = []

        // Find column indices for expected fields
        const columnMap = this.mapColumns(headers, [
            'config_id', 'table_name', 'name', 'id'
        ])

        for (let i = 1; i < data.length; i++) {
            const row = data[i]
            if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined)) continue

            const table = {
                config_id: this.getCellValue(row, columnMap.config_id) || this.getCellValue(row, columnMap.id) || '',
                table_name: this.getCellValue(row, columnMap.table_name) || this.getCellValue(row, columnMap.name) || '',
                id: this.getCellValue(row, columnMap.id) || this.getCellValue(row, columnMap.config_id) || '',
                name: this.getCellValue(row, columnMap.name) || this.getCellValue(row, columnMap.table_name) || ''
            }

            // Only add if we have at least a config_id or name
            if (table.config_id || table.name) {
                tables.push(table)
            }
        }

        return tables
    }

    // Process custom table columns sheet data
    processCustomTableColumnsSheet(data) {
        if (data.length < 2) return []

        const headers = data[0]
        const columns = []

        // Find column indices for expected fields
        const columnMap = this.mapColumns(headers, [
            'key', 'label', 'width', 'name', 'field'
        ])

        for (let i = 1; i < data.length; i++) {
            const row = data[i]
            if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined)) continue

            const column = {
                key: this.getCellValue(row, columnMap.key) || this.getCellValue(row, columnMap.name) || '',
                label: this.getCellValue(row, columnMap.label) || this.getCellValue(row, columnMap.name) || '',
                width: parseInt(this.getCellValue(row, columnMap.width)) || 200
            }

            // Only add if we have at least a key or label
            if (column.key || column.label) {
                columns.push(column)
            }
        }

        return columns
    }

    // Process custom table data sheet data
    processCustomTableDataSheet(data) {
        if (data.length < 2) return []

        const headers = data[0]
        const tableData = []

        // Find column indices for expected fields
        const columnMap = this.mapColumns(headers, [
            'id', 'name', 'value', 'field'
        ])

        for (let i = 1; i < data.length; i++) {
            const row = data[i]
            if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined)) continue

            const item = {
                id: this.getCellValue(row, columnMap.id) || '',
                name: this.getCellValue(row, columnMap.name) || this.getCellValue(row, columnMap.field) || '',
                value: this.getCellValue(row, columnMap.value) || ''
            }

            // Only add if we have at least an id or name
            if (item.id || item.name) {
                tableData.push(item)
            }
        }

        return tableData
    }

    // Auto-detect entities from sheet data
    autoDetectEntities(data) {
        if (data.length < 2) return []

        const headers = data[0]
        const entities = []

        const columnMap = this.mapColumns(headers, [
            'registration', 'legal', 'name', 'status', 'address', 'scan', 'date'
        ])

        for (let i = 1; i < data.length; i++) {
            const row = data[i]
            if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined)) continue

            const entity = {
                registration_id: this.getCellValue(row, columnMap.registration) || '',
                legal_name: this.getCellValue(row, columnMap.legal) || this.getCellValue(row, columnMap.name) || '',
                status: this.getCellValue(row, columnMap.status) || '',
                address: this.getCellValue(row, columnMap.address) || '',
                last_scan: this.getCellValue(row, columnMap.scan) || this.getCellValue(row, columnMap.date) || ''
            }

            if (entity.registration_id || entity.legal_name) {
                entities.push(entity)
            }
        }

        return entities
    }

    // Map column headers to expected field names
    mapColumns(headers, expectedFields) {
        const columnMap = {}

        expectedFields.forEach(field => {
            columnMap[field] = headers.findIndex(header =>
                header && header.toString().toLowerCase().includes(field)
            )
        })

        return columnMap
    }

    // Get cell value safely
    getCellValue(row, columnIndex) {
        if (columnIndex === -1 || columnIndex >= row.length) return null
        const value = row[columnIndex]
        return value !== null && value !== undefined ? value.toString().trim() : null
    }

    // Clear cache
    clearCache() {
        this.cachedData = null
        this.lastLoadTime = null
    }

    // Get cache status
    getCacheStatus() {
        if (!this.cachedData || !this.lastLoadTime) {
            return { hasCache: false, age: null }
        }

        const age = Date.now() - this.lastLoadTime
        return {
            hasCache: true,
            age: age,
            isExpired: age >= this.cacheExpiry
        }
    }
}

// Export singleton instance
export const localDatabaseService = new LocalDatabaseService()
export default localDatabaseService
