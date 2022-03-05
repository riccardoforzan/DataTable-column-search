function AddTriggerOnChangedVisibility(id){
    
    //Retrieve the object
    let table_id = $(`#${id}`);
    let table = table_id.DataTable();

    table.on('column-visibility.dt', function (e, settings, column_index, show) {
        //console.log(`Column ${column_index} has changed to show:${show}`);
        const target = $(`#${id} thead`).find('.filter').eq(column_index)
        if(show){
            target.show();
        } else {
            target.hide();
        }

    } );

}

/**
 * Creates a searchable header for DT object.
 * If you disable during creation the disabled the search on some fields, the searchable header
 * will not work as expected
 * @param id (string) id of the datatable object
 */
function CreateSearchableHeader(id){

    let table_id = $(`#${id}`);

    // Check if the given table is a datatable
    if(!$.fn.DataTable.isDataTable(table_id)){
        throw `CreateSearchableHeader: '${id}' is not a valid initialized datatable!`;
    }

    // Retrieve DT object
    let table = table_id.DataTable();

    // Duplicate the header of the table, create a spot for every visible column
    let html_second_header = '<tr>';
    table.columns().every(function () {
        const column = this;
        html_second_header += '<th class="filter"></th>';
    });
    html_second_header += '</tr>';

    $(`#${id} thead`).append(html_second_header);

    //Arrays to be initialized
    search_on_columns = []; 
    select_on_columns = [];

    // Look for what you should add
    table.columns().every( function () {

        const column = this;

        const headerNode = $(column.header())
        .closest("tr")
        .children()
        .eq(column.index());

        const headerClasses = headerNode.prop('classList');
        if(headerClasses !== undefined){

            if(headerClasses.contains('text-search')){
                search_on_columns.push(column.index());
            }
            if(headerClasses.contains('select-search')){
                select_on_columns.push(column.index());
            }

        }

    });

    // Add search input (text)
    table.columns(search_on_columns).every( function () {

        let column = this;

        let nodeBelow = $(column.header())
        .closest("tr")
        .next()
        .children()
        .eq(column.index());

        let input = $(`<input type="text" class="form-control" placeholder="Search here" style="min-width:120px;width: 100%;"/>`).appendTo($(nodeBelow).empty());

        input.on("keyup change", function () {
            if (column.search() !== this.value) {
                column.search(this.value).draw();
            }
        });

    });

    // Add selectors
    table.columns(select_on_columns).every( function () {

        let column = this;

        let nodeBelow = $(column.header())
        .closest("tr")
        .next()
        .children()
        .eq(column.index());

        let select = $('<select class="selectpicker" data-live-search="true" style="width: 100%;"><option value=""></option></select>').appendTo($(nodeBelow).empty());

        column
        .data()
        .unique()
        .sort()
        .each(function (d, j) {
            select.append(`<option value="${d}">${d}</option>`);
        });

        select.selectpicker().on("change", function () {
            let val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? "^" + val + "$" : "", true, false).draw();
        });

    });

}


function AddSearch(id){
    CreateSearchableHeader(id);
    AddTriggerOnChangedVisibility(id);
}