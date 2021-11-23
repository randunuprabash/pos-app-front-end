import {  Customer } from "./dto/customer";
import $ from 'jquery';

// const BASE_API ='https://1930cad0-9d4c-4d8a-98a3-69ee429e411a.mock.pstmn.io';
const BASE_API ='http://localhost:8080/pos';
const CUSTOMERS_SERVICE_API=`${BASE_API}/customers`;
const PAGE_SIZE= 6;

let customers: Array<Customer>=[];
let totalCustomers=0;
let selectedPage=1;
let pageCount =1;

loadAllCustomers();


function loadAllCustomers():void{

    $.get(CUSTOMERS_SERVICE_API+`?page=${selectedPage}&size=${PAGE_SIZE}`).then((data)=>{
        customers=data;

            $('#tbl-customers tbody tr').remove();
    
                    customers.forEach((c)=>{
                        const rowHtml=`<tr>
                        <td>${c.id}</td>
                        <td>${c.name}</td>
                        <td>${c.address}</td>
                        <td><i class="fas fa-trash"></i></td>
                        </tr>`; 
        
                        $('#tbl-customers tbody').append(rowHtml);
    })
    initPagination();  
    }).catch((err)=>{
        alert("Failed to fetch the customers.....");
        console.log(err);
    });


    // $.ajax(CUSTOMERS_SERVICE_API+`?page=${selectedPage}&size=${PAGE_SIZE}`,{
    //     method:'GET'
    // }).then((data)=>{
    //     customers=data;

    //     $('#tbl-customers tbody tr').remove();

    //             customers.forEach((c)=>{
    //                 const rowHtml=`<tr>
    //                 <td>${c.id}</td>
    //                 <td>${c.name}</td>
    //                 <td>${c.address}</td>
    //                 <td><i class="fas fa-trash"></i></td>
    //                 </tr>`; 
    
    //                 $('#tbl-customers tbody').append(rowHtml);
    //             });
    //             initPagination();
    // }).catch((err)=>{
    //     alert("Failed to fetch the customers");
    //     console.log("err");
    // }).always(()=>{
    //     console.log("always");
    // });



    // const http=new XMLHttpRequest();

    // http.onreadystatechange= ()=>{

    //     if(http.readyState==http.DONE){
    //         if(http.status!==200){
    //             alert('failed to fetch the customers, try again ...');
    //             return;
    //         }
    //        totalCustomers = +(http.getResponseHeader('X-Total-Count'));
      
    //         customers = JSON.parse(http.responseText);
    //         $('#tbl-customers tbody tr').remove();

    //         customers.forEach((c)=>{
    //             const rowHtml=`<tr>
    //             <td>${c.id}</td>
    //             <td>${c.name}</td>
    //             <td>${c.address}</td>
    //             <td><i class="fas fa-trash"></i></td>
    //             </tr>`; 

    //             $('#tbl-customers tbody').append(rowHtml);
    //         });
    //         initPagination();
    //     }
    // }

    // http.open('GET',CUSTOMERS_SERVICE_API+`?page=${selectedPage}&size=${PAGE_SIZE}`,true);

    // http.send();
}

function initPagination(): void{

    pageCount=Math.ceil(totalCustomers/PAGE_SIZE);
    showOrHidePagination();
    if(pageCount==1)return;

    let html=`<li class="page-item"><a class="page-link" href="javascript:void(0);">&laquo;</a></li>`
     for(let i=0; i < pageCount ; i++){
         html+=`<li class="page-item ${selectedPage==(i+1)?'active':''}"><a class="page-link" href="javascript:void(0);">${i+1}</a></li>`
     }
    html+=`<li class="page-item"><a class="page-link" href="javascript:void(0);">&raquo;</a></li>`;
    $('ul.pagination').html(html);

    if(selectedPage == 1){
        $(".page-item:first-child").addClass('disabled');
    }else if(selectedPage == pageCount){
        $(".page-item:last-child").addClass('disabled');
    }

    $(".page-item:first-child").on('click',()=>navigateToPage(selectedPage-1));
    $(".page-item:last-child").on('click',()=>navigateToPage(selectedPage+1));
  

    $(".page-item:not(.page-item:first-child, .page-item:last-child)").on('click',function(){
        navigateToPage(+$(this).text())
    });
}

function navigateToPage(page:number):void{
    if(page<1 || page>pageCount)throw('Inavlid page number');
    selectedPage=page;
    loadAllCustomers();
}

function showOrHidePagination():void{
pageCount>1? $(".pagination").show(): $(".pagination").hide();
}

$("#btn-save").on('click',(eventData)=>{
    eventData.preventDefault();

    const txtId=$("#txt-id");
    const txtName=$("#txt-name");
    const txtAddress=$("#txt-address");

    let id=(txtId.val() as String).trim();
    let name=(txtName.val() as String).trim();
    let address=(txtAddress.val() as String).trim();

    let validated=true;
    $('#txt-id,#txt-name,#txt-address').removeClass('is-invalid');

    if(!/^[A-Za-z ]+$/.test(name)){
        txtName.addClass('is-invalid');
        txtName.trigger('select');
        validated=false;
    }

    if(address.length<3){
        txtAddress.addClass('is-invalid');
        txtAddress.trigger('select');
        validated=false;
    }

    if(!/^C\d{3}$/.test(id)){
        txtId.addClass('is-invalid');
        txtId.trigger('select');
        validated=false;
    }

    if(!validated){
        return;
    }
    saveCustomer(new Customer(id,name,address));
});

function saveCustomer(customer:Customer):void{
    const http=new XMLHttpRequest();

    http.onreadystatechange=()=>{

        if(http.readyState!==http.DONE)return;

        if(http.status!==201){
            alert('Failed to save the customer!,retry');
            return;
        }

        alert("Customer has been saved sucessfully");
        totalCustomers++;
        pageCount=Math.ceil(totalCustomers/PAGE_SIZE);
        navigateToPage(pageCount);
        $("#txt-id, #txt-name, #txt-address").val("");
        $("#txt-id").trigger('focus');
    };

    http.open('POST',CUSTOMERS_SERVICE_API,true);

    http.setRequestHeader('content-type','application/json');

    http.send(JSON.stringify(customer));
}