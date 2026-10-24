import sys

def error_message(error,error_detail:sys):
    _,_,exec_tb=error_detail.exc_info()
    filename=exec_tb.tb_frame.f_code.co_filename
    line_no=exec_tb.tb_lineno
    error_message="Exception Occured in [{0}] file in line number [{1}] and the error is [{2}]".format(
        filename,
        line_no,
        error
    )
    return error_message

class CustomException(Exception):
    def __init__(self,error,error_detail:sys):
        super().__init__(error)
        self.error_message_var=error_message(error=error,error_detail=error_detail)

    def __str__(self):
        return self.error_message_var

