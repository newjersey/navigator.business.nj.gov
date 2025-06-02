DECLARE
  v_rate1              VARCHAR2(100);
  v_rate2              VARCHAR2(100);
  v_rate3              VARCHAR2(100);
  v_rate4              VARCHAR2(100);
  v_rate5              VARCHAR2(100);
  v_rate6              VARCHAR2(100);
  v_rate7              VARCHAR2(100);
  v_rate8              VARCHAR2(100);
  v_rate9              VARCHAR2(100);
  v_rate10             VARCHAR2(100);
  v_rate11             VARCHAR2(100);
  v_rate12             VARCHAR2(100);
  v_taxable_wages      VARCHAR2(100);
  v_base_week_amt      VARCHAR2(100);
  v_number_base_weeks  VARCHAR2(100);
  v_taxable_wages_w    VARCHAR2(100);
BEGIN
  PRC_GET_EMP_EXP_RATE(
    i_fein => '022248181800000',
    i_qtr  => 2,
    i_year => 2022,
    rate1 => v_rate1,
    rate2 => v_rate2,
    rate3 => v_rate3,
    rate4 => v_rate4,
    rate5 => v_rate5,
    rate6 => v_rate6,
    rate7 => v_rate7,
    rate8 => v_rate8,
    rate9 => v_rate9,
    rate10 => v_rate10,
    rate11 => v_rate11,
    rate12 => v_rate12,
    taxable_wages => v_taxable_wages,
    base_week_amt => v_base_week_amt,
    number_base_weeks => v_number_base_weeks,
    taxable_wages_w => v_taxable_wages_w
  );

  -- Show output
  DBMS_OUTPUT.PUT_LINE('Rate1: ' || v_rate1);
  DBMS_OUTPUT.PUT_LINE('Rate2: ' || v_rate2);
  DBMS_OUTPUT.PUT_LINE('Rate3: ' || v_rate3);
  DBMS_OUTPUT.PUT_LINE('Rate4: ' || v_rate4);
  DBMS_OUTPUT.PUT_LINE('Rate5: ' || v_rate5);
  DBMS_OUTPUT.PUT_LINE('Rate6: ' || v_rate6);
  DBMS_OUTPUT.PUT_LINE('Rate7: ' || v_rate7);
  DBMS_OUTPUT.PUT_LINE('Rate8: ' || v_rate8);
  DBMS_OUTPUT.PUT_LINE('Rate9: ' || v_rate9);
  DBMS_OUTPUT.PUT_LINE('Rate10: ' || v_rate10);
  DBMS_OUTPUT.PUT_LINE('Rate11: ' || v_rate11);
  DBMS_OUTPUT.PUT_LINE('Rate12: ' || v_rate12);
  DBMS_OUTPUT.PUT_LINE('Taxable Wages: ' || v_taxable_wages);
  DBMS_OUTPUT.PUT_LINE('Base Week Amt: ' || v_base_week_amt);
  DBMS_OUTPUT.PUT_LINE('Number Base Weeks: ' || v_number_base_weeks);
  DBMS_OUTPUT.PUT_LINE('Taxable Wages W: ' || v_taxable_wages_w);
END;
/
