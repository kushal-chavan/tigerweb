$(document).ready(function(){
    $('.delete-article').on('click', function(e){
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url:'/blog/articles/'+id,
            success: function(){
                alert('Deleting Article');
                window.location.href='/blog/articles/view';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});
