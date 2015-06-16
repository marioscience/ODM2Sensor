function removeCommas(table) {
    var lastColumn = table.rows[0].cells.length - 1;

    for (var i = 1; i < table.rows.length; i++) {
        data = table.rows[i].cells[lastColumn].innerHTML.trim();
        table.rows[i].cells[lastColumn].innerHTML = data.substr(0, data.length - 1);
    }
}

function setNavActive() {
    $(".active").removeClass("active");

    var currentPath = window.location.pathname;

    if (currentPath.indexOf("inventory") > 0) {
        $("#inventory-nav").addClass("active");
    } else if (currentPath.indexOf("sites") > 0) {
        $("#sites-nav").addClass("active");
    } else if (currentPath.indexOf("site-visits") > 0) {
        $("#visits-nav").addClass("active");
    } else if (currentPath.indexOf("control-vocabularies") > 0) {
        $("#vocabulary-nav").addClass("active");
    }
}

// Function by Sameer Kazi
function getUrlParameters(param) {
    var pageURL = window.location.search.substring(1);
    var URLVariables = pageURL.split('&');
    for (var i = 0; i < URLVariables.length; i++) {
        var parameterName = URLVariables[i].split('=');
        if (parameterName[0] == param) {
            return parameterName[1];
        }
    }
}

function changeTab(tab) {
    var href = window.location.href;
    var getStart = href.indexOf('?');
    if (getStart !== -1) {
        href = href.substr(0, getStart);
    }
    //window.location.href = href + '?tab='+tab; causes reload :(
    var stateObj = {tab: tab};
    history.replaceState(stateObj, tab, '?tab=' + tab);
}

function setInitialTab($) {
    var currentTab = getUrlParameters('tab');
    if (currentTab) {
        $("[aria-controls=" + currentTab + "]").parent().addClass('active');
        $('#' + currentTab).addClass('active in');
    } else {
        $('#site').addClass("active in");
        $('#initial_tab').addClass('active');
    }
}

function initVocabulariesTabs($) {
    setInitialTab($);
}

function setDeleteConfirmation() {
    /*http://ethaizone.github.io/Bootstrap-Confirmation/*/
    $('#danger-button').confirmation({
        placement: 'bottom',
        title: 'Are you sure you want to delete?',
        popout: true,
        btnCancelClass: 'btn-default',
        onCancel: function () {
            $('#danger-button').confirmation('hide');
        }
    });
}

function set_delete_icon() {
    $('.delete-icon').confirmation({
        placement: 'left',
        title: 'Are you sure?',
        btnCancelClass: 'btn-default',
        onCancel: function () {
            $('.delete-icon').confirmation('hide');
        },
        onConfirm: function () {
            var tableClicked = $(this).parents('.dataTables_wrapper').attr('id');
            var table = $('#' + tableClicked);
            var searchText = table.find('input[type="search"]')[0].value;

            sessionStorage.setItem('tableClicked', tableClicked);
            var tablePage = table.find('.paginate_button.current')[0].getAttribute('data-dt-idx');

            if (searchText != "") {
                sessionStorage.setItem('searchTerm', searchText);
                if (tablePage > 0) {
                    sessionStorage.setItem('tablePage', tablePage);
                }
            } else {
                sessionStorage.setItem('tablePage', tablePage);
            }

        }
    });
}

function setDateTimePicker() {
    /* http://tarruda.github.io/bootstrap-datetimepicker/ */
    var dateElements = [];
    dateElements.push($('#id_equipmentpurchasedate'));
    dateElements.push($("[name='begindatetime']"));
    dateElements.push($("[name='enddatetime']"));
    dateElements.push($("[name='referencematerialpurchasedate']"));
    dateElements.push($("[name='referencematerialexpirationdate']"));

    dateElements.forEach(function (element) {
        element.wrap("<div class='datetimepicker input-append date'></div");
        element.removeClass('form-control');
        element.after(
            $("<span class='add-on'><i data-time-icon='glyphicon glyphicon-time' data-date-icon='glyphicon glyphicon-calendar'></i></span>")
        );

    });

    //format: 'm/d/Y H:i'
    $('.datetimepicker').datetimepicker({
        format: 'yyyy-MM-dd hh:mm:ss'
    })
        .on('changeDate', beginDTChanged);

    var siteVisitEndDTElem = $('.form-table').children().first().find("[name='enddatetime']");

    setFormEndTime(siteVisitEndDTElem, new Date());

    var button = $(".timepicker-picker a");
    button.addClass('btn-default');
    button.find('.icon-chevron-up').addClass('glyphicon glyphicon-chevron-up');
    button.find('.icon-chevron-down').addClass('glyphicon glyphicon-chevron-down');
}

function beginDTChanged(ev) {
    var changedInputName = $(ev.currentTarget).find('input').attr('name');
    if (changedInputName !== 'enddatetime') {
        var beginDate = new Date($(this).find('input').val());
        var endDTElem = $(ev.currentTarget).parents('tbody').find("[name='enddatetime']");
        setFormEndTime(endDTElem, beginDate)
    }
}

function setFormEndTime(endTimeElem, newDate) {
    var endDTPickerObj = $(endTimeElem.parents('.datetimepicker')).data('datetimepicker');
    var elemInitiallyEmpty = endTimeElem.val() === "";
    var endLessThanBegin = !elemInitiallyEmpty && newDate < new Date(endTimeElem.val());


    endDTPickerObj.setStartDate(newDate);
    if (!endLessThanBegin) {
        endDTPickerObj.setDate(newDate);
    }

    if (elemInitiallyEmpty) {
        endTimeElem.val("");
    } 
    
}

function setFormFields() {
    $('input').addClass('form-control');
    $("[type='checkbox']").removeClass('form-control');
    $('textarea').addClass('form-control');
    $('select').addClass('select-two');

    $(".select-two").select2();
}

$(document).ready(function () {
    setNavActive();

    setDeleteConfirmation();

    set_delete_icon();

    $('.dataTables_paginate').click(function () {
        set_delete_icon();
    });

    $('.dataTables_filter').find('input[type="search"]').change(function () {
        set_delete_icon();
    });

    setDateTimePicker();

    setFormFields();

    initVocabulariesTabs($);
});

// Action Form stuff

function addActionForm(that) {
    var button = $(that).parents('tbody');
    var form = $('#action-form').children();

    var thisForm = form.clone();
    thisForm.insertBefore(button);
    button.prev().prepend('<tr><th></th><td><a class="btn btn-danger col-xs-2 col-sm-2" onclick="javascript:deleteActionForm(this)">- Remove Action</a></td></tr>');
    $(".select2-container").remove();
    $(".select-two").select2();
    //format: 'm/d/Y H:i'
    $('.datetimepicker').datetimepicker({
        format: 'MM/dd/yyyy hh:mm:ss'
    });
    $(".select2-container").attr('style', 'width:85%');

    $(thisForm).find('.select-two[name="actiontypecv"]').change(function () {
        var selected = $(this).val();//$(this).next().find('.select2-selection__rendered').html();
        var currentActionForm = $(this).parents('tbody');
        formSelected(selected, currentActionForm);
    });

    // This bit of code solves the problem of th checkbox not sending status when is unchecked.
    // ie. it will not send False to the server
    $(thisForm).find('.maintenance[type="checkbox"]').change(function () {
        var thisCheckBox = $(this)
        var hiddenCheckBox = thisCheckBox.parents('tbody').find('#id_isfactoryservicebool');
        if (thisCheckBox[0].checked) {
            hiddenCheckBox.attr('value', 'True');
        } else {
            hiddenCheckBox.attr('value', 'False');
        }
    });

    $(thisForm).find(".calibration").parents('tr').hide();
    $(thisForm).find(".maintenance").parents('tr').hide();
}

function deleteActionForm(that) {
    $(that).parents('tbody').remove();
}

function formSelected(formType, currentForm) {
    var formClasses = {
        'EquipmentDeployment': 'deployment',
        'InstrumentCalibration': 'calibration',
        'EquipmentMaintenance': 'maintenance'
    };

    for (var key in formClasses) {
        if (formClasses.hasOwnProperty(key) && key !== formType) {
            $(currentForm).find('.' + formClasses[key]).parents('tr').hide();
        }
    }

    if (formClasses.hasOwnProperty(formType)) {
        $(currentForm).find('.' + formClasses[formType]).parents('tr:hidden').show();
    }
}